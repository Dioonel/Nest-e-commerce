import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

import { UsersService } from './../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService){}

  @Get()
  getProducts(){
    return this.usersService.getAll();
  }

  @Get(':id')
  getOneProduct(@Param('id') id: string){
    return this.usersService.getOne(id);
  }

  @Post()
  createProduct(@Body() body: any){
    return this.usersService.create(body);
  }

  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() body: any){
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
