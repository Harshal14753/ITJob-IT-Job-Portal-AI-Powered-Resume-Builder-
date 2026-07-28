import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaClock,
    FaVideo,
    FaPhone,
    FaBuilding,
    FaMapMarkerAlt,
    FaCheck,
    FaTimes,
    FaEdit,
    FaSpinner,
    FaArrowLeft,
    FaPlus,
    FaExternalLinkAlt,
    FaUserCircle,
    FaBriefcase,
    FaChevronDown
} from "react-icons/fa";
import { UserDataContext } from "../../context/UserContext";
import {
    getUpcomingInterviews,
    getAllInterviews,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    completeInterview,
    getJobs,
    getApplicantsForJob
} from "../../services/JobService";
import { useToast } from "../../components/Toast";

const STATUS_STYLES = {
    SCHEDULED: { label: "Scheduled", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    COMPLETED: { label: "Completed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    CANCELLED: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const MODE_ICONS = {
    VIDEO_CALL: <FaVideo />,
    PHONE: <FaPhone />,
    IN_PERSON: <FaBuilding />,
};

const RecruiterInterviews = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { userData } = useContext(UserDataContext);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [filter, setFilter] = useState("upcoming");
    const [formData, setFormData] = useState({
        applicationId: "",
        interviewDate: "",
        interviewTime: "",
        interviewMode: "VIDEO_CALL",
        interviewLink: "",
        notes: "",
    });
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobSearch, setJobSearch] = useState("");
    const [showJobDropdown, setShowJobDropdown] = useState(false);
    const [interviewCandidates, setInterviewCandidates] = useState([]);
    const [candidateSearch, setCandidateSearch] = useState("");
    const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    useEffect(() => {
        fetchInterviews();
    }, [filter]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const data = filter === "upcoming"
                ? await getUpcomingInterviews()
                : await getAllInterviews();
            setInterviews(data);
        } catch (error) {
            console.error("Error fetching interviews:", error);
            addToast("Failed to load interviews.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchJobsForDropdown = async () => {
        try {
            const jobsData = await getJobs();
            setJobs(jobsData);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            addToast("Failed to load jobs.", "error");
        }
    };

    const fetchInterviewCandidates = async (jobId) => {
        setLoadingCandidates(true);
        try {
            const apps = await getApplicantsForJob(jobId);
            const interviewing = apps
                .filter((a) => a.status === "INTERVIEWING")
                .map((a) => ({
                    applicationId: a.applicationId,
                    fullName: a.fullName,
                    email: a.email,
                }));
            setInterviewCandidates(interviewing);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            addToast("Failed to load candidates.", "error");
            setInterviewCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const openScheduleModal = async () => {
        setEditMode(false);
        setSelectedJob(null);
        setJobSearch("");
        setCandidateSearch("");
        setInterviewCandidates([]);
        setFormData({
            applicationId: "",
            interviewDate: "",
            interviewTime: "",
            interviewMode: "VIDEO_CALL",
            interviewLink: "",
            notes: "",
        });
        await fetchJobsForDropdown();
        setShowScheduleModal(true);
    };

    const openRescheduleModal = (interview) => {
        setEditMode(true);
        setSelectedInterview(interview);
        setFormData({
            applicationId: interview.applicationId || "",
            interviewDate: interview.interviewDate || "",
            interviewTime: interview.interviewTime || "",
            interviewMode: interview.interviewMode || "VIDEO_CALL",
            interviewLink: interview.interviewLink || "",
            notes: interview.notes || "",
        });
        setShowScheduleModal(true);
    };

    const handleSchedule = async () => {
        try {
            if (editMode && selectedInterview) {
                await rescheduleInterview(selectedInterview.id, formData);
            } else {
                await scheduleInterview(formData.applicationId, formData);
            }
            setShowScheduleModal(false);
            setSelectedInterview(null);
            fetchInterviews();
            addToast(
                editMode ? "Interview rescheduled successfully!" : "Interview scheduled successfully!",
                "success"
            );
        } catch (error) {
            console.error("Error scheduling interview:", error);
            addToast("Failed to schedule interview.", "error");
        }
    };

    const handleCancel = async (interviewId) => {
        if (!window.confirm("Are you sure you want to cancel this interview?")) return;
        try {
            await cancelInterview(interviewId);
            fetchInterviews();
            addToast("Interview cancelled.", "info");
        } catch (error) {
            console.error("Error cancelling interview:", error);
            addToast("Failed to cancel interview.", "error");
        }
    };

    const handleComplete = async (interviewId) => {
        try {
            await completeInterview(interviewId);
            fetchInterviews();
            addToast("Interview marked as completed.", "success");
        } catch (error) {
            console.error("Error completing interview:", error);
            addToast("Failed to complete interview.", "error");
        }
    };

    const formatTime = (time) => {
        if (!time) return "";
        const [h, m] = time.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    };

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        const date = new Date(dateStr);
        return date.toDateString() === today.toDateString();
    };

    const isPast = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date(new Date().toDateString());
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button onClick={() => navigate("/hire/dashboard")} className="flex items-center gap-2 text-white/80 hover:text-white mb-3 transition-colors">
                            <FaArrowLeft className="text-sm" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold">Interview Scheduling</h1>
                        <p className="text-orange-100 mt-2">Schedule, manage, and track all your candidate interviews.</p>
                    </div>
                    <button onClick={openScheduleModal}
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                        <FaPlus /> Schedule Interview
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
                <button onClick={() => setFilter("upcoming")}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === "upcoming" ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-orange-50"}`}>
                    Upcoming
                </button>
                <button onClick={() => setFilter("all")}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === "all" ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-orange-50"}`}>
                    All Interviews
                </button>
            </div>

            {/* Interview List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-orange-500 text-4xl" />
                </div>
            ) : interviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <FaCalendarAlt className="text-3xl text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">No Interviews Yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        {filter === "upcoming"
                            ? "No upcoming interviews scheduled. Click 'Schedule Interview' to create one."
                            : "No interviews found. Schedule your first interview to get started."}
                    </p>
                    <button onClick={openScheduleModal}
                        className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all">
                        <FaPlus className="inline mr-2" />Schedule Interview
                    </button>
                </div>
            ) : (
                <div className="grid gap-5">
                    {interviews.map((interview) => {
                        const statusStyle = STATUS_STYLES[interview.status] || STATUS_STYLES.SCHEDULED;
                        const modeIcon = MODE_ICONS[interview.interviewMode] || <FaVideo />;
                        const today = isToday(interview.interviewDate);
                        const past = isPast(interview.interviewDate) && interview.status === "SCHEDULED";

                        return (
                            <div key={interview.id}
                                className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all ${today ? "ring-2 ring-orange-400" : ""} ${past ? "opacity-70" : ""}`}>
                                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {interview.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-gray-800 truncate">{interview.fullName || "Unknown"}</h3>
                                                {today && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Today</span>}
                                                {past && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                <FaBriefcase className="text-gray-400 text-xs" />
                                                {interview.jobTitle}
                                            </p>

                                            {/* Date & Time */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    <FaCalendarAlt className="text-orange-500 text-xs" />
                                                    {formatDate(interview.interviewDate)}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    <FaClock className="text-orange-500 text-xs" />
                                                    {formatTime(interview.interviewTime)}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    <span className="text-orange-500 text-xs">{modeIcon}</span>
                                                    {interview.interviewMode?.replace(/_/g, " ") || "—"}
                                                </span>
                                                {interview.interviewLink && (
                                                    <a href={interview.interviewLink} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1.5 text-blue-600 hover:underline">
                                                        <FaExternalLinkAlt className="text-xs" /> Join
                                                    </a>
                                                )}
                                            </div>

                                            {interview.notes && (
                                                <p className="text-sm text-gray-500 mt-2 italic bg-slate-50 rounded-lg p-2">
                                                    "{interview.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 md:mt-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                            {statusStyle.label}
                                        </span>

                                        {interview.status === "SCHEDULED" && (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => openRescheduleModal(interview)}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all" title="Reschedule">
                                                    <FaEdit className="text-xs" />
                                                </button>
                                                <button onClick={() => handleComplete(interview.id)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all" title="Mark Completed">
                                                    <FaCheck className="text-xs" />
                                                </button>
                                                <button onClick={() => handleCancel(interview.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="Cancel">
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            </div>
                                        )}
                                        {interview.status === "COMPLETED" && (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <FaCheck /> Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule / Reschedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 md:p-8 pb-4 shrink-0">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {editMode ? "Reschedule Interview" : "Schedule New Interview"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {editMode ? "Update the interview details below." : "Fill in the details to schedule an interview with a candidate."}
                            </p>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 md:px-8 pb-2 space-y-4">
                            {/* Job Selector (only show when scheduling new) */}
                            {!editMode && (
                                <>
                                    {/* Step 1: Select Job */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Job *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search job title..."
                                                value={showJobDropdown ? jobSearch : (selectedJob?.title || "")}
                                                onChange={(e) => {
                                                    setJobSearch(e.target.value);
                                                    setShowJobDropdown(true);
                                                    if (!e.target.value) {
                                                        setSelectedJob(null);
                                                        setInterviewCandidates([]);
                                                        setFormData({ ...formData, applicationId: "" });
                                                    }
                                                }}
                                                onFocus={() => { setShowJobDropdown(true); setShowCandidateDropdown(false); }}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all pr-10"
                                            />
                                            <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showJobDropdown ? "rotate-180" : ""}`} />
                                        </div>
                                        {showJobDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {jobs
                                                    .filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase()))
                                                    .length === 0 ? (
                                                    <div className="p-4 text-center text-gray-400 text-sm">No jobs found</div>
                                                ) : (
                                                    jobs
                                                        .filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase()))
                                                        .map((job) => (
                                                            <div
                                                                key={job.id}
                                                                onClick={() => {
                                                                    setSelectedJob(job);
                                                                    setJobSearch(job.title);
                                                                    setShowJobDropdown(false);
                                                                    setFormData({ ...formData, applicationId: "" });
                                                                    setCandidateSearch("");
                                                                    fetchInterviewCandidates(job.id);
                                                                }}
                                                                className={`p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 ${selectedJob?.id === job.id ? "bg-orange-50" : ""}`}
                                                            >
                                                                <p className="font-medium text-gray-800 text-sm">{job.title}</p>
                                                                <p className="text-xs text-gray-400">{job.location || "—"}</p>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 2: Select Candidate */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Select Candidate *
                                            {selectedJob && <span className="text-gray-400 font-normal"> (Interviewing stage)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={selectedJob ? "Search candidate name..." : "Select a job first"}
                                                value={showCandidateDropdown ? candidateSearch : (formData.applicationId ? interviewCandidates.find((c) => c.applicationId === formData.applicationId)?.fullName || "" : "")}
                                                onChange={(e) => {
                                                    setCandidateSearch(e.target.value);
                                                    setShowCandidateDropdown(true);
                                                }}
                                                onFocus={() => {
                                                    if (selectedJob) { setShowCandidateDropdown(true); setShowJobDropdown(false); }
                                                }}
                                                disabled={!selectedJob}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                            {loadingCandidates && (
                                                <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin" />
                                            )}
                                            {!loadingCandidates && (
                                                <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showCandidateDropdown ? "rotate-180" : ""}`} />
                                            )}
                                        </div>
                                        {showCandidateDropdown && selectedJob && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {interviewCandidates.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-400 text-sm">
                                                        No candidates in Interviewing stage for this job.
                                                        <br />
                                                        <span className="text-xs">Move applicants to Interviewing status first.</span>
                                                    </div>
                                                ) : (
                                                    interviewCandidates
                                                        .filter((c) => c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()))
                                                        .map((candidate) => (
                                                            <div
                                                                key={candidate.applicationId}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, applicationId: candidate.applicationId });
                                                                    setCandidateSearch(candidate.fullName);
                                                                    setShowCandidateDropdown(false);
                                                                }}
                                                                className={`p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 ${formData.applicationId === candidate.applicationId ? "bg-orange-50" : ""}`}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                    {candidate.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-800 text-sm">{candidate.fullName}</p>
                                                                    <p className="text-xs text-gray-400">{candidate.email}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Date *</label>
                                <input type="date" value={formData.interviewDate}
                                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all" />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Time *</label>
                                <input type="time" value={formData.interviewTime}
                                    onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all" />
                            </div>

                            {/* Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: "VIDEO_CALL", label: "Video Call", icon: <FaVideo /> },
                                        { value: "PHONE", label: "Phone", icon: <FaPhone /> },
                                        { value: "IN_PERSON", label: "In Person", icon: <FaBuilding /> },
                                    ].map((mode) => (
                                        <button key={mode.value} onClick={() => setFormData({ ...formData, interviewMode: mode.value })}
                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.interviewMode === mode.value ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                            {mode.icon}
                                            <span className="text-xs font-medium">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Video Link */}
                            {formData.interviewMode === "VIDEO_CALL" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Link</label>
                                    <input type="url" placeholder="https://meet.google.com/..." value={formData.interviewLink}
                                        onChange={(e) => setFormData({ ...formData, interviewLink: e.target.value })}
                                        maxLength={500}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all" />
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} placeholder="Interview notes, instructions, or topics to cover..." value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    maxLength={1000}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all resize-none" />
                            </div>
                        </div>

                        <div className="shrink-0 p-6 md:p-8 pt-4 border-t border-gray-100">
                            <div className="flex gap-3">
                                <button onClick={() => setShowScheduleModal(false)}
                                    className="flex-1 p-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSchedule}
                                    disabled={!formData.interviewDate || !formData.interviewTime || (!editMode && !formData.applicationId)}
                                    className="flex-1 p-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {editMode ? "Update Interview" : "Schedule Interview"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterInterviews;
