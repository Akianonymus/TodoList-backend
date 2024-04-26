import { Types } from 'mongoose';

export type ReqUser = {
  userId: Types.ObjectId;
  tokenType: string;
};

export interface CustomExpressRequest extends Request {
  user: ReqUser;
}
