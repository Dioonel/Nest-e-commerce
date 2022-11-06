import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import { Cart } from './../entities/cart.entity';
import { CreateItemDTO } from 'src/products/dtos/items.dtos';

@Injectable()
export class CartsStoreService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async getAll() {
    return await this.cartModel.find()
      .populate({ path: 'items.product', select: '-__v'})
      .select('-__v');
  }

  async getOne(id: string) {
    const cart = await this.cartModel.findById(id)
      .populate({ path: 'items.product', select: '-__v'})
      .select('-__v');
    if(!cart){
      throw new NotFoundException("Cart not found.");
    }
    return cart;
  }

  async getCartByUser(userId: string){
    const user = new ObjectId(userId);
    const cart = await this.cartModel.findOne({ user })
      .populate({ path: 'items.product', select: '-__v'})
      .select('-__v');
    if(!cart){
      throw new NotFoundException("Cart not found.");
    }
    return cart;
  }

  async create(){
    const newCart = new this.cartModel();
    return await newCart.save();
  }

  async initUser(id: string, userId: string){
    return await this.cartModel.findByIdAndUpdate(id, {$set: { user: userId }}, {new: true});
  }

  async pushItem(userId: string, newItem: CreateItemDTO){
    const user = new ObjectId(userId);
    const cart = await this.cartModel.findOne({ user }).populate('items.product');
    if(!cart){
      throw new NotFoundException("Cart not found.");
    }
    const index = cart.items.findIndex(item => item.product._id.toString() === newItem.product);
    if(index === -1) {
      return await this.cartModel.findOneAndUpdate({ user }, { $addToSet: { items: newItem }}, { new: true })  // If item is not in cart, add it
        .populate({ path: 'items.product', select: '-__v'})
        .select('-__v');
    }
    cart.items[index].quantity += newItem.quantity;                                                 // If item is already in cart, add quantity
    await cart.save();
    return await this.cartModel.findOne({ user })
      .populate({ path: 'items.product', select: '-__v'})
      .select('-__v');
  }

  async popItem(userId: string, productId: string){
    const user = new ObjectId(userId);
    const cart = await this.cartModel.findOne({ user });
    if(!cart){
      throw new NotFoundException("Cart not found.");
    }
    const index = cart.items.findIndex((item) => item.product.toString() === productId);
    if(index === -1){
      throw new NotFoundException("Product not found.");
    }
    cart.items.splice(index, 1);
    await cart.save();
    return await this.cartModel.findOne({ user })
      .populate({ path: 'items.product', select: '-__v'})
      .select('-__v');
  }

  async empty(userId: string){
    const user = new ObjectId(userId);
    const cart = await this.cartModel.findOneAndUpdate({ user }, { items: [] }, { new: true })
      .select('-__v');
    if(!cart){
      throw new NotFoundException("Cart not found.");
    }
    return cart;
  }

  async delete(id: string){
    const cart = await this.cartModel.findByIdAndDelete(id);
    if (!cart) {
      throw new NotFoundException("Cart not found.");
    }
    return true;
  }
}
