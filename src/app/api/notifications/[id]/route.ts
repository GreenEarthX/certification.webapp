import { NextResponse } from "next/server";
import { updateNotificationReadStatus } from "@/services/notifications/notificationService";

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Extracts last segment (ID)

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
  }

  try {
    const updatedNotification = await updateNotificationReadStatus(id);
    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update notification" },
      { status: (error as Error).message === "Notification not found" ? 404 : 500 }
    );
  }
}
