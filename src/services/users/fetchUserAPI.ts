import {User} from "../../models/user";

export async function fetchUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/users/me");
    if (!res.ok) throw new Error("User not found");

    return await res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
