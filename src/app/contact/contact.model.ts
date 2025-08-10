import { model, Schema } from "mongoose";
import { TContact } from "./contact.interface";


const contactSchema = new Schema<TContact>({
  name: {
    type: String,
  },
  email: {
    type: String
  },
  garageName: {
    type: String
  },
  phone: {
    type: String,
  },
  message: {
    type: String
  }
}, {
  timestamps: true
});

export const Contact = model<TContact>('Contact', contactSchema);
