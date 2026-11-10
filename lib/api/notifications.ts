import { fetchWithAuth } from './core';

// Mirrors fastapi-backend app/api/v1/notifications.py.

export interface NotificationOut {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  items: NotificationOut[];
  unread_count: number;
  next_cursor: string | null;
}

export const notificationsApi = {
  list(unreadOnly = false, cursor?: string): Promise<NotificationPage> {
    const qs = new URLSearchParams();
    if (unreadOnly) qs.set('unread_only', 'true');
    if (cursor) qs.set('cursor', cursor);
    const q = qs.toString();
    return fetchWithAuth<NotificationPage>(`/notifications${q ? `?${q}` : ''}`);
  },

  /** `null` marks every notification read. */
  markRead(ids: string[] | null): Promise<{ unread_count: number }> {
    return fetchWithAuth<{ unread_count: number }>('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};
