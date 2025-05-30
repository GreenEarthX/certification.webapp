"use server";

import { getUsersRoles } from "./getUsersRoles";

// Check if the current user is an admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const roles = await getUsersRoles();

    console.log("ROLES", roles);
    return roles.some((role) => role.name.toLowerCase() === "admin"); // or can check for role ID
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
