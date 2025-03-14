import { useEffect, useState } from "react";
import { Notification } from "@/models/notification";
import { getNotifications, markNotificationAsReadService } from "@/services/notifications/fetchService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id: number) => {
    try {
      await markNotificationAsReadService(id);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return { notifications, loading, error, fetchNotifications, markNotificationAsRead };
}
