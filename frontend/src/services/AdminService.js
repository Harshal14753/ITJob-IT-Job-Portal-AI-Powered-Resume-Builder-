import http from "../config/AxiosHelper";

export const getAdminDashboard = async () => {
    const response = await http.get("/admin/dashboard");
    return response.data;
};

export const getAdminUsers = async (search) => {
    const params = search ? { search } : {};
    const response = await http.get("/admin/users", { params });
    return response.data;
};

export const deleteAdminUser = async (userId) => {
    const response = await http.delete(`/admin/users/${userId}`);
    return response.data;
};

export const getAdminJobs = async (page = 0, size = 10, sortBy = "createdAt", sortDir = "desc") => {
    const response = await http.get("/admin/jobs", {
        params: { page, size, sortBy, sortDir },
    });
    return response.data;
};

export const getPendingJobs = async () => {
    const response = await http.get("/admin/jobs/pending");
    return response.data;
};

export const approveAdminJob = async (jobId) => {
    const response = await http.put(`/admin/jobs/${jobId}/approve`);
    return response.data;
};

export const rejectAdminJob = async (jobId) => {
    const response = await http.put(`/admin/jobs/${jobId}/reject`);
    return response.data;
};

export const toggleAdminJobFeatured = async (jobId) => {
    const response = await http.put(`/admin/jobs/${jobId}/feature`);
    return response.data;
};

export const deleteAdminJob = async (jobId) => {
    const response = await http.delete(`/admin/jobs/${jobId}`);
    return response.data;
};

export const getAdminCategories = async () => {
    const response = await http.get("/admin/categories");
    return response.data;
};

export const createAdminCategory = async (categoryData) => {
    const response = await http.post("/admin/categories", categoryData);
    return response.data;
};

export const updateAdminCategory = async (categoryId, categoryData) => {
    const response = await http.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
};

export const deleteAdminCategory = async (categoryId) => {
    const response = await http.delete(`/admin/categories/${categoryId}`);
    return response.data;
};

export const getAdminContacts = async (pendingOnly = false) => {
    const params = { pendingOnly };
    const response = await http.get("/admin/contacts", { params });
    return response.data;
};

export const resolveAdminContact = async (contactId) => {
    const response = await http.put(`/admin/contacts/${contactId}/resolve`);
    return response.data;
};

export const deleteAdminContact = async (contactId) => {
    const response = await http.delete(`/admin/contacts/${contactId}`);
    return response.data;
};

export const seedAdminUser = async () => {
    const response = await http.post("/admin/seed-admin");
    return response.data;
};

// ========== Skill Management ==========

export const getAdminSkills = async (search) => {
    const params = search ? { search } : {};
    const response = await http.get("/admin/skills", { params });
    return response.data;
};

export const createAdminSkill = async (skillData) => {
    const response = await http.post("/admin/skills", skillData);
    return response.data;
};

export const updateAdminSkill = async (skillId, skillData) => {
    const response = await http.put(`/admin/skills/${skillId}`, skillData);
    return response.data;
};

export const deleteAdminSkill = async (skillId) => {
    const response = await http.delete(`/admin/skills/${skillId}`);
    return response.data;
};
