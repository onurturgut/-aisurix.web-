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
