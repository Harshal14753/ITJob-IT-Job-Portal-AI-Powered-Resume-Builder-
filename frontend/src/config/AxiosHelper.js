import axios from "axios"
import { refreshToken } from "../services/UserService";

export const BASE_URL = import.meta.env.VITE_BASE_URL

const http = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

http.interceptors.request.use((config) => {

    // Skip Authorization header for pre-login auth endpoints (no token yet)
    const noAuthPaths = ["/auth/send-otp", "/auth/verify-otp", "/auth/refresh"];
    if (config.url && noAuthPaths.includes(config.url)) {
        return config;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (
        accessToken &&
        accessToken !== "null" &&
        accessToken !== "undefined"
    ) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

http.interceptors.response.use(
    response => response,

    async (error) => {
        const originalRequest = error.config;

        const errorCode = error.response?.data?.error;

        // Access token expired
        if (
            error.response?.status === 401 &&
            errorCode === "TOKEN_EXPIRED" &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh"
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await refreshToken();

                localStorage.setItem(
                    "accessToken",
                    refreshResponse.accessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${refreshResponse.accessToken}`;

                return http(originalRequest);

            } catch (refreshError) {

                localStorage.removeItem("accessToken");
                localStorage.removeItem("role");
                localStorage.removeItem("profileCompleted");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        // Invalid or tampered token
        if (
            error.response?.status === 401 &&
            errorCode === "INVALID_TOKEN"
        ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("profileCompleted");

            window.location.href = "/login";
        }

        // 403 Forbidden - redirect to unauthorized page
        // if (error.response?.status === 403) {
        //     window.location.href = "/unauthorized";
        //     return Promise.reject(error);
        // }

        return Promise.reject(error);
    }
);

export default http;