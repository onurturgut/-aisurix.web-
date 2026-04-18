export type AuthSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  isAdmin: boolean;
};
