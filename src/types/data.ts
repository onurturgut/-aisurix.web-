export type Project = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  status: string;
  tags: string[];
  icon: string | null;
  link: string | null;
  display_order: number | null;
  created_at?: string;
  updated_at?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  type: string | null;
  detail: string;
  is_read: boolean;
  created_at: string;
};
