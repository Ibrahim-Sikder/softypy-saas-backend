import { ObjectId } from "mongoose";

export interface TNote {
  title: string;
  content: string;
  customerId: ObjectId;
  companyId: ObjectId;
  showRoomId: ObjectId;
}
