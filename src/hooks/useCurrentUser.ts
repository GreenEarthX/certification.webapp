import { useEffect, useState } from "react";
import { fetchUser } from "@/services/users/fetchUserAPI";
import { fetchCurrentBackendUser } from "@/services/current-user";
import {User} from "../models/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser();
        if (userData) {
          setUser(userData);
          return;
        }

        try {
          const backendUser = await fetchCurrentBackendUser();
          const name = backendUser.name?.trim() || backendUser.email || "";
          const [firstName, ...rest] = name.split(" ").filter(Boolean);
          const fallbackUser: User = {
            user_id: backendUser.id,
            first_name: firstName || null,
            last_name: rest.length ? rest.join(" ") : null,
            email: backendUser.email,
            company: backendUser.company ?? null,
            auth0sub: backendUser.authid,
          };
          setUser(fallbackUser);
        } catch {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading };
}
