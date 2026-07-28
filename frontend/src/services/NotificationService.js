import http from "../config/AxiosHelper";

export const getNotifications = async () => {
    const response = await http.get("/notifications");
    return response.data;
};

export const getUnreadNotifications = async () => {
    const response = await http.get("/notifications/unread");
    return response.data;
};

export const getUnreadNotificationCount = async () => {
    const response = await http.get("/notifications/unread-count");
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await http.put(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await http.put("/notifications/read-all");
    return response.data;
};
