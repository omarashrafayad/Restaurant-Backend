import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Atomic sequences (e.g. order numbers). */
@Schema({ collection: 'counters', versionKey: false })
export class Counter {
  @Prop({ required: true })
  _id: string;

  @Prop({ default: 0 })
  seq: number;
}
export const CounterSchema = SchemaFactory.createForClass(Counter);

export const ORDER_NUMBER_START = 1000;
