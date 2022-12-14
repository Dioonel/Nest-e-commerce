import { Injectable, Inject, forwardRef } from '@nestjs/common';

import { PostingsStoreService } from './postings-store.service';
import { UsersService } from './../../users/services/users.service';
import { CartsService } from './../../users/services/carts.service';
import { CommentsService } from './comments.service';
import { rawPostingDTO, CreatePostingDTO, FilterPostingDTO } from './../dtos/posting.dto';
import { Comment } from './../entities/comment.entity';

@Injectable()
export class PostingsService {
  constructor(
    private postingsStore: PostingsStoreService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => CartsService))
    private cartsService: CartsService,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService
    ) {}

  async getAll(query?: FilterPostingDTO) {
    return await this.postingsStore.getAll(query);
  }

  async getOne(id: string) {
    return await this.postingsStore.getOne(id);
  }

  async create(data: rawPostingDTO, userId: string) {
    const myPosting: CreatePostingDTO = {
      seller: userId,
      title: data.title,
      description: data.description,
      price: data.price,
      image: data.image
    }
    const post = await this.postingsStore.create(myPosting);
    await this.usersService.pushPosting(userId, post._id);
    return post;
  }

  async getPostingsFromUser(userId: string) {
    return await this.postingsStore.getPostingsFromUser(userId);
  }

  async delete(postingId: string, userId: string) {
    const post = await this.postingsStore.getOne(postingId);
    if(post.seller?._id.toString() === userId || post.seller === null){
      const res = await this.postingsStore.delete(postingId);
      await this.commentsService.deleteCommentsFromPosting(postingId);
      await this.usersService.popPosting(userId, post._id);
      await this.cartsService.deletePostFromAllCarts(postingId);
      return res;
    }
    return { message: "Stop trying to hack please :)" };
  }

  async deletePostingsFromUser(userId: string) {
    return this.postingsStore.deletePostingsFromUser(userId);
  }

  async pushComment(postId: string, commentId: string) {
    return await this.postingsStore.pushComment(postId, commentId);
  }

  async popComment(postId: string, commentId: string) {
    return await this.postingsStore.popComment(postId, commentId);
  }

  async popManyComments(comments: Comment[]) {
    for(let comment of comments){
      await this.postingsStore.popComment(comment.posting, comment._id);
    }
    return true;
  }
}
