import http from "../config/AxiosHelper";

export const updateCandidateProfile = async (profileData) => {
    try {
        const response = await http.put("/candidate/profile", profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating candidate profile:", error);
        throw error;
    }
};

export const getCandidateProfile = async () => {
    try {
        const response = await http.get("/candidate/profile");
        return response.data;
    } catch (error) {
        console.error("Error fetching candidate profile:", error);
        throw error;
    }
};

/* ── Resume API ──────────────────────────────────────────────────── */

export const uploadResume = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await http.post("/candidate/resume", formData);
        return response.data;
    } catch (error) {
        console.error("Error uploading resume:", error);
        throw error;
    }
};

export const deleteResume = async () => {
    try {
        const response = await http.delete("/candidate/resume");
        return response.data;
    } catch (error) {
        console.error("Error deleting resume:", error);
        throw error;
    }
};

export const getResumeInfo = async () => {
    try {
        const response = await http.get("/candidate/resume");
        return response.data;
    } catch (error) {
        console.error("Error fetching resume info:", error);
        throw error;
    }
};

export const downloadResume = async () => {
    try {
        const response = await http.get("/candidate/resume/download");
        return response.data; // Returns { downloadUrl: "..." }
    } catch (error) {
        console.error("Error getting resume download URL:", error);
        throw error;
    }
};
