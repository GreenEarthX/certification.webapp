"use server";

import axios from "axios";

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// Create an access token for the Auth0 management API
export async function createAccessToken(): Promise<string> {
  try {
    const response = await axios.post<AccessTokenResponse>(
      `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
      }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get Auth0 management token");
  }
}
