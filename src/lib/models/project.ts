import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    long_description: { type: String, default: null },
    status: { type: String, required: true, default: "Yayında" },
    tags: { type: [String], default: [] },
    icon: { type: String, default: "Globe" },
    link: { type: String, default: null },
    display_order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel: Model<ProjectDocument> =
  (models.Project as Model<ProjectDocument> | undefined) ||
  model<ProjectDocument>("Project", projectSchema);
