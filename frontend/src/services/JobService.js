import http from "../config/AxiosHelper"

export const createJob = async (jobData) => {
    try {
        console.log("2");
        const response = await http.post("/recruiter/jobs", jobData);
        console.log("3");
        return response.data;
    } catch (error) {
        console.log("4");
        console.error("Error creating job:", error);

        console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Headers:", error.response?.headers);
        throw error;
    }
}

export const getJobs = async () => {
    const response = await http.get("/recruiter/jobs");
    return response.data;
}

export const getJobById = async (jobId) => {
    const response = await http.get(`/recruiter/jobs/${jobId}`);
    return response.data;
}

export const updateJob = async (jobId, jobData) => {
    const response = await http.put(`/recruiter/jobs/${jobId}`, jobData);
    return response.data;
}

export const deleteJob = async (jobId) => {
    const response = await http.delete(`/recruiter/jobs/${jobId}`);
    return response.data;
}

export const saveDraft = async (jobData) => {
    const response = await http.post("/recruiter/jobs/draft", jobData);
    return response.data;
}

export const publishDraft = async (jobId) => {
    const response = await http.post(`/recruiter/jobs/${jobId}/publish`);
    return response.data;
}

// ========== Candidate Job Endpoints ==========

export const getAllJobsForCandidate = async (page = 0, size = 12) => {
    const response = await http.get("/candidate/jobs", {
        params: { page, size },
    });
    return response.data;
}

export const getJobByIdForCandidate = async (jobId) => {
    const response = await http.get(`/candidate/jobs/${jobId}`);
    return response.data;
}

export const applyForJob = async (jobId) => {
    const response = await http.post(`/candidate/jobs/${jobId}/apply`);
    return response.data;
}

export const getMyApplications = async (page = 0, size = 10) => {
    const response = await http.get("/candidate/jobs/applications", {
        params: { page, size },
    });
    return response.data;
}

// ========== Job Search & Filter ==========

export const searchJobs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.skills && params.skills.length > 0) {
    params.skills.forEach((skill) => queryParams.append("skills", skill));
  }
  if (params.location) {
    queryParams.append("location", params.location);
  }
  if (params.minExperience !== undefined && params.minExperience !== null) {
    queryParams.append("minExperience", params.minExperience);
  }
  if (params.page !== undefined) {
    queryParams.append("page", params.page);
  }
  if (params.size !== undefined) {
    queryParams.append("size", params.size);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `/candidate/jobs/search?${queryString}` : "/candidate/jobs";
  const response = await http.get(url);
  return response.data;
};

// ========== Recruiter Dashboard ==========

export const getRecruiterDashboard = async () => {
    const response = await http.get("/recruiter/jobs/dashboard");
    return response.data;
};

// ========== Search Talent ==========

export const searchCandidates = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.location) queryParams.append("location", params.location);
  const queryString = queryParams.toString();
  const url = queryString ? `/recruiter/candidates/search?${queryString}` : "/recruiter/candidates/search";
  const response = await http.get(url);
  return response.data;
};

// ========== Saved Candidates ==========

export const saveCandidate = async (candidateId) => {
    const response = await http.post(`/recruiter/saved-candidates/${candidateId}`);
    return response.data;
};

export const unsaveCandidate = async (candidateId) => {
    const response = await http.delete(`/recruiter/saved-candidates/${candidateId}`);
    return response.data;
};

export const getSavedCandidates = async () => {
    const response = await http.get("/recruiter/saved-candidates");
    return response.data;
};

export const isCandidateSaved = async (candidateId) => {
    const response = await http.get(`/recruiter/saved-candidates/${candidateId}/status`);
    return response.data;
};

// ========== Recruiter — Applicant Management ==========

export const getApplicantsForJob = async (jobId, page = 0, size = 10) => {
    const response = await http.get(`/recruiter/jobs/${jobId}/applicants`, {
        params: { page, size },
    });
    return response.data;
}

export const getApplicantById = async (jobId, applicationId) => {
    const response = await http.get(`/recruiter/jobs/${jobId}/applicants/${applicationId}`);
    return response.data;
}

export const updateApplicationStatus = async (jobId, applicationId, status) => {
    const response = await http.patch(`/recruiter/jobs/${jobId}/applicants/${applicationId}/status`, { status });
    return response.data;
}

// ========== Interview Scheduling ==========

export const getUpcomingInterviews = async () => {
    const response = await http.get("/recruiter/interviews/upcoming");
    return response.data;
};

export const getAllInterviews = async () => {
    const response = await http.get("/recruiter/interviews");
    return response.data;
};

export const scheduleInterview = async (applicationId, interviewData) => {
    const response = await http.post(`/recruiter/interviews/schedule/${applicationId}`, interviewData);
    return response.data;
};

export const rescheduleInterview = async (interviewId, interviewData) => {
    const response = await http.patch(`/recruiter/interviews/${interviewId}/reschedule`, interviewData);
    return response.data;
};

export const cancelInterview = async (interviewId) => {
    const response = await http.patch(`/recruiter/interviews/${interviewId}/cancel`);
    return response.data;
};

export const completeInterview = async (interviewId) => {
    const response = await http.patch(`/recruiter/interviews/${interviewId}/complete`);
    return response.data;
};

// ========== AI Auto-Apply Review Jobs ==========

export const getAIApplyReviewJobs = async () => {
    const response = await http.get("/candidate/ai-apply/review-jobs");
    return response.data;
};

export const applyForReviewJob = async (jobId) => {
    const response = await http.post(`/candidate/ai-apply/review-jobs/${jobId}/apply`);
    return response.data;
};

// ========== Shared Skills ==========

export const getAllSkills = async (search) => {
    const params = search ? { search } : {};
    const response = await http.get("/skills", { params });
    return response.data;
};

// ========== Candidate Interviews ==========

export const getCandidateInterviews = async () => {
    const response = await http.get("/candidate/jobs/interviews");
    return response.data;
};

export const getCandidateUpcomingInterviews = async () => {
    const response = await http.get("/candidate/jobs/interviews/upcoming");
    return response.data;
};