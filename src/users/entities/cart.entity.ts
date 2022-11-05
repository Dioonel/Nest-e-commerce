import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';

@Schema()
export class Cart extends Document{
  @Prop({ type: [{
    product: { required: true, type: Types.ObjectId, ref: Product.name, immutable: true },
    quantity: { required: true, type: Number, default: 1 },
    subtotal: { required: false, type: Number }
  }], immutable: false })
  items: Types.Array<Record<string, any>> | undefined[];

  @Prop({ required: false, type: Number })
  total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
