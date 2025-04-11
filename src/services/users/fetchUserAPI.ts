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