import http from "../config/AxiosHelper";

// ========== Recruiter Messaging API ==========

export const getRecruiterConversations = async () => {
    const response = await http.get("/recruiter/messages/conversations");
    return response.data;
};

export const createOrGetConversation = async (candidateId) => {
    const response = await http.post(`/recruiter/messages/conversations/${candidateId}`);
    return response.data;
};

export const getRecruiterMessages = async (conversationId, page = 0, size = 50) => {
    const response = await http.get(`/recruiter/messages/conversations/${conversationId}`, {
        params: { page, size },
    });
    return response.data;
};

export const sendRecruiterMessage = async (conversationId, content) => {
    const response = await http.post(`/recruiter/messages/conversations/${conversationId}/send`, { content });
    return response.data;
};

export const markRecruiterConversationAsRead = async (conversationId) => {
    const response = await http.put(`/recruiter/messages/conversations/${conversationId}/read`);
    return response.data;
};

export const getRecruiterUnreadCount = async () => {
    const response = await http.get("/recruiter/messages/unread-count");
    return response.data;
};

// ========== Candidate Messaging API ==========

export const getCandidateConversations = async () => {
    const response = await http.get("/candidate/messages/conversations");
    return response.data;
};

export const getCandidateMessages = async (conversationId, page = 0, size = 50) => {
    const response = await http.get(`/candidate/messages/conversations/${conversationId}`, {
        params: { page, size },
    });
    return response.data;
};

export const sendCandidateMessage = async (conversationId, content) => {
    const response = await http.post(`/candidate/messages/conversations/${conversationId}/send`, { content });
    return response.data;
};

export const markCandidateConversationAsRead = async (conversationId) => {
    const response = await http.put(`/candidate/messages/conversations/${conversationId}/read`);
    return response.data;
};

export const getCandidateUnreadCount = async () => {
    const response = await http.get("/candidate/messages/unread-count");
    return response.data;
};
