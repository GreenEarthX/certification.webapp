import { User } from "../../models/user";
import { getToken } from "@/lib/shared-auth";

export async function fetchUser(): Promise<User | null> {
  try {
    const token = getToken();
    if (!token) {
      console.error("No auth token found.");
      return null;
    }
    const res = await fetch("/api/users/me", {
      headers: { "x-auth-token": token },
    });
    if (!res.ok) throw new Error("User not found");

    return await res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}


export async function submitUserProfile(formData: Record<string, any>): Promise<boolean> {
  try {
    const res = await fetch('/api/users/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    return res.ok;
  } catch (error) {
    console.error('Error submitting user profile:', error);
    return false;
  }
}
