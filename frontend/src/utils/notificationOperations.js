import api from "@/lib/apiClient";

export const fetchNotifications = async () => {
  return api.get('/api/notifications');
};

export const markNotificationAsRead = async (id) => {
  return api.put(`/api/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return api.put('/api/notifications/read-all');
};

export const deleteNotification = async (id) => {
  return api.delete(`/api/notifications/${id}`);
};
