import type { ContactMessage, Project } from "@/types/data";

type MongoDocument = {
  _id: { toString(): string };
};

export function serializeProject(
  project: MongoDocument & {
    title: string;
    description: string;
    long_description?: string | null;
    status: string;
    tags?: string[] | null;
    icon?: string | null;
    link?: string | null;
    display_order?: number | null;
    created_at?: Date;
    updated_at?: Date;
  },
): Project {
  return {
    id: project._id.toString(),
    title: project.title,
    description: project.description,
    long_description: project.long_description || null,
    status: project.status,
    tags: project.tags || [],
    icon: project.icon || null,
    link: project.link || null,
    display_order: project.display_order ?? 0,
    created_at: project.created_at?.toISOString(),
    updated_at: project.updated_at?.toISOString(),
  };
}

export function serializeContactMessage(
  message: MongoDocument & {
    name: string;
    email: string;
    type?: string | null;
    detail: string;
    is_read: boolean;
    created_at?: Date | string;
  },
): ContactMessage {
  return {
    id: message._id.toString(),
    name: message.name,
    email: message.email,
    type: message.type || null,
    detail: message.detail,
    is_read: message.is_read,
    created_at:
      typeof message.created_at === "string"
        ? message.created_at
        : message.created_at?.toISOString() || new Date().toISOString(),
  };
}
