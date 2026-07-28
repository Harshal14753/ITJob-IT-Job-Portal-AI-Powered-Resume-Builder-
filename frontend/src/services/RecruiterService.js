import http from "../config/AxiosHelper";

export const getRecruiterProfile = async () => {
    try {
        const response = await http.get("/recruiter/profile");
        return response.data;
    } catch (error) {
        console.log("Error fetching recruiter profile:", error);
        throw new Error("Failed to fetch recruiter profile");
    }
}

export const createRecruiterProfile = async (profileData) => {
    try {
        const response = await http.post("/recruiter/profile", profileData);
        return response.data;
    } catch (error) {
        console.log("Error creating recruiter profile:", error);
        throw new Error("Failed to create recruiter profile");
    }
}

export const updateRecruiterProfile = async (profileData) => {
    try {
        const response = await http.put("/recruiter/profile", profileData);
        return response.data;
    } catch (error) {
        console.log("Error updating recruiter profile:", error);
        throw new Error("Failed to update recruiter profile");
    }
}

export const deleteRecruiterProfile = async () => {
    try {
        const response = await http.delete("/recruiter/profile");
        return response.data;
    } catch (error) {
        console.log("Error deleting recruiter profile:", error);
        throw new Error("Failed to delete recruiter profile");
    }
}