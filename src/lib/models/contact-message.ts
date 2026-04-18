import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, default: null },
    detail: { type: String, required: true, trim: true },
    is_read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

type ContactMessageDocument = InferSchemaType<typeof contactMessageSchema>;

export const ContactMessageModel: Model<ContactMessageDocument> =
  (models.ContactMessage as Model<ContactMessageDocument> | undefined) ||
  model<ContactMessageDocument>("ContactMessage", contactMessageSchema);
