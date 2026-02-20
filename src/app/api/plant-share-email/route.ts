import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

export const runtime = "nodejs";

type ShareEmailPayload = {
  toEmail: string;
  toName?: string | null;
  sharedByName?: string | null;
  sharedByEmail?: string | null;
  plantName: string;
  plantId: number;
};

function getCca() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !tenantId || !clientSecret) {
    throw new Error("Missing Microsoft Graph credentials.");
  }

  return new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });
}

async function getAccessToken(): Promise<string> {
  const cca = getCca();
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  if (!result?.accessToken) {
    throw new Error("Failed to acquire access token");
  }
  return result.accessToken;
}

async function getGraphClient() {
  const token = await getAccessToken();
  return Client.init({
    authProvider: (done) => done(null, token),
  });
}

async function sendMail(to: string, subject: string, html: string, from: string) {
  const client = await getGraphClient();
  await client.api(`/users/${from}/sendMail`).post({
    message: {
      subject,
      body: { contentType: "HTML", content: html },
      toRecipients: [{ emailAddress: { address: to } }],
      from: { emailAddress: { address: from } },
    },
  });
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ShareEmailPayload;
    const {
      toEmail,
      toName,
      sharedByName,
      sharedByEmail,
      plantName,
      plantId,
    } = payload;

    if (!toEmail || !plantName || !plantId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const from = process.env.EMAIL_USER;
    if (!from) {
      return NextResponse.json(
        { error: "EMAIL_USER not configured." },
        { status: 500 }
      );
    }

    const displaySharer = sharedByName?.trim() || sharedByEmail?.trim() || "A user";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(to right, #0072BC, #00B140); padding: 16px 20px; text-align: center; color: #fff; font-weight: 600; }
          .logo { max-width: 140px; height: auto; display: block; margin: 0 auto 8px; }
          .content { padding: 28px; }
          .content h1 { color: #1f2937; font-size: 20px; margin-bottom: 16px; }
          .content p { color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 10px; }
          .highlight { font-weight: 700; color: #1d4ed8; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 16px; }
          .footer { background: #f4f4f4; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://geomap.greenearthx.io/gex-logo.png" alt="GEX Logo" />
            Green Fuel Compliance
          </div>
          <div class="content">
            <h1>Plant shared with you</h1>
            <p><span class="highlight">${displaySharer}</span> shared a plant with you.</p>
            ${sharedByEmail ? `<p><span class="highlight">Shared by:</span> ${sharedByEmail}</p>` : ""}
            <div class="card">
              <p><span class="highlight">Plant:</span> ${plantName}</p>
              <p><span class="highlight">Plant ID:</span> ${plantId}</p>
              ${toName ? `<p><span class="highlight">Recipient:</span> ${toName}</p>` : ""}
            </div>
            <p style="margin-top: 18px;">Log in to view it in your Shared Plants list.</p>
          </div>
          <div class="footer">© 2026 GEX. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;

    await sendMail(toEmail, `Plant shared with you: ${plantName}`, html, from);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      err?.message ||
      err?.response?.data?.error?.message ||
      err?.body?.error?.message ||
      "Failed to send share email.";
    console.error("Failed to send share email:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
