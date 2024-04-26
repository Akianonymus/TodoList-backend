import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import Opts from 'src/options';

export type ForgotPasswordDocument = ForgotPassword & Document;

export enum ForgotPasswordOtpStatus {
  USED = 'used',
  EXPIRED = 'expired',
  CREATED = 'created',
}

@Schema()
export class ForgotPassword {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ minlength: 6 })
  otp: number;

  @Prop({
    default: () => {
      return new Date(Date.now() + Opts.FORGOT_PASSWORD_OTP_EXPIRY_SCHEMA);
    },
    type: Date,
  })
  expireAt: Date;

  @Prop({ default: ForgotPasswordOtpStatus.CREATED, required: true })
  status: ForgotPasswordOtpStatus;
}

export const ForgotPasswordSchema =
  SchemaFactory.createForClass(ForgotPassword);
