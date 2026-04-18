import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const adminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: true },
    source: { type: String, default: "manual" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

type AdminUserDocument = InferSchemaType<typeof adminUserSchema>;

export const AdminUserModel: Model<AdminUserDocument> =
  (models.AdminUser as Model<AdminUserDocument> | undefined) ||
  model<AdminUserDocument>("AdminUser", adminUserSchema);
