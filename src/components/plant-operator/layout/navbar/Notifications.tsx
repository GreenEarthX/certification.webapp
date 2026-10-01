import React, { useCallback, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Notification } from "@/models/notification";
import { useDismissable } from "@/hooks/useDismissable";

interface NotificationsProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markNotificationAsRead: (id: number) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, loading, error, markNotificationAsRead }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsNotificationOpen(false), []);
  useDismissable(rootRef, isNotificationOpen, close);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (id: number) => {
    await markNotificationAsRead(id);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-gex-sm ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200 active:scale-95 data-[open=true]:bg-brand-50 data-[open=true]:text-brand-700 data-[open=true]:ring-brand-300"
        data-open={isNotificationOpen}
        aria-label="View Notifications"
        aria-haspopup="menu"
        aria-expanded={isNotificationOpen}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-[18px] text-white bg-red-600 rounded-full ring-2 ring-white tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-gex-md border border-slate-200 bg-white shadow-gex-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 tabular-nums">
                {unreadCount} new
              </span>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto p-1">
            {loading ? (
              <li className="space-y-2 p-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </li>
            ) : error ? (
              <li className="p-4 text-sm text-red-600">{error}</li>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    role="menuitem"
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`flex w-full items-start gap-3 rounded-gex-sm px-3 py-2 text-left text-sm hover:bg-slate-50 active:bg-slate-100 ${
                      !notification.read ? "bg-brand-50/60" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        !notification.read ? "bg-brand-600" : "bg-transparent"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <p className={`leading-snug ${!notification.read ? "font-medium text-slate-900" : "text-slate-600"}`}>
                        {notification.message}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <BellOff className="size-5" />
                </span>
                <p className="text-sm font-medium text-slate-700">You&apos;re all caught up</p>
                <p className="text-xs text-slate-500">No new notifications</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
