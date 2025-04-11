import { useEffect, useState } from "react";
import { fetchUser } from "@/services/users/fetchUserAPI";
import {User} from "../models/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      setUser(userData);
      setLoading(false);
    };

    loadUser();
  }, []);

  return { user, loading };
}
