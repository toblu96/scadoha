import type { Ref } from "vue";
import { useState } from "#imports";

interface IUser {
  avatar: string;
  created: string;
  email: string;
  id: string;
  isNew: boolean;
  updated: string;
  emailVisibility: boolean;
  name: string;
  username: string;
  verified: boolean;
}

export const usePocketbaseUser = (): Ref<IUser | null> => {
  const user = useState<IUser | null>("pocketbase_user");

  return user;
};
