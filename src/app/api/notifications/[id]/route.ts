import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notifications/notificationService";

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
  }

  try {
    const updated = await NotificationService.markAsRead(req, id);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating notification:", error);

    const message = error instanceof Error ? error.message : "Failed to update notification";
    const status = message === "Notification not found or unauthorized" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
