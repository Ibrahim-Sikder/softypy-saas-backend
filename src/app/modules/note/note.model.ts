import { Schema, model } from 'mongoose';
import { TNote } from './note.interface';

export const noteSchema = new Schema<TNote>(
  {

    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    showRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'ShowRoom',
    },
   
  },
  { timestamps: true }
);

export const Note = model<TNote>('Note', noteSchema);
