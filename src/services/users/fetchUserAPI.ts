import { User } from "../../models/user";
import { getToken } from "@/lib/shared-auth";

export async function fetchUser(): Promise<User | null> {
  try {
    const token = getToken();
    const res = token
      ? await fetch("/api/users/me", { headers: { "x-auth-token": token } })
      : await fetch("/api/users/me", { credentials: "include" });
    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
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
