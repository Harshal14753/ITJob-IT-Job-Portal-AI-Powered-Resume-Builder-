import http from "../config/AxiosHelper";

export const getOTP = async (email, role) => {
    try {
        const response = await http.post("/auth/send-otp", { email, role });
        return response.data;
    }catch (error) {
        console.log("Error sending OTP:", error);
        throw new Error("Failed to send OTP", { cause: error });
    }
}

export const verifyOTP = async (email, otp) => {
    try {
        console.log("4")
        const response = await http.post("/auth/verify-otp", { email, otp });
        console.log("5")
        return response.data;
    }catch (error) {
        console.log("Error verifying OTP:", error);

        console.log("6")
        throw new Error("Failed to verify OTP", { cause: error });
    }
}

export const refreshToken = async () => {
    try {
        const response = await http.post("/auth/refresh");
        return response.data;
    } catch (error) {
        console.log("Error refreshing token:", error);
        throw new Error("Failed to refresh token", { cause: error });
    }
}

export const logout = async () => {
    try {
        const response = await http.post("/auth/logout");
        return response.data;
    } catch (error) {
        console.log("Error logging out:", error);
        throw new Error("Failed to logout", { cause: error });
    }
}

