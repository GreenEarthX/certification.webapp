import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notifications/notificationService";

export async function GET(req: NextRequest) {
  try {
    const notifications = await NotificationService.getUserNotifications(req);
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
