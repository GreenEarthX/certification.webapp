import { Notification } from "@/models/notification";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch("/api/notifications");
    if (!response.ok) throw new Error("Failed to fetch notifications");

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error((error as Error).message);
  }
}

// Mark a notification as read
export async function markNotificationAsReadService(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "PUT",
    });

    if (!response.ok) throw new Error(`Failed to update: ${response.statusText}`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error((error as Error).message);
  }
}
