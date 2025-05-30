"use server";

import { createAccessToken } from "./createAccessToken";
import { getSession } from "@auth0/nextjs-auth0";

type Role = {
  id: string;
  name: string;
  description: string;
};

// Get the roles for the current user in Auth0 Management API
export async function getUsersRoles(): Promise<Role[]> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await createAccessToken();

  const response = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}/roles`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user roles");
  }

  const data: Role[] = await response.json();
  return data;
}
