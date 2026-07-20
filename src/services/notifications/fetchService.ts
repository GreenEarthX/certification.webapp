import { Notification } from "@/models/notification";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch("/api/notifications");
    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    return [];
  }
}

// Mark a notification as read
export async function markNotificationAsReadService(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "PUT",
    });

    if (!response.ok) {
      return;
    }
  } catch (error) {
    return;
  }
}
