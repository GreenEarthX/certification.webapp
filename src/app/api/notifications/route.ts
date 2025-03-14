import { NextResponse } from "next/server";
import { getNotifications } from "@/services/notifications/notificationService";

export async function GET() {
  try {
    const notifications = await getNotifications();
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
