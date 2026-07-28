import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaClock,
    FaVideo,
    FaPhone,
    FaBuilding,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaArrowLeft,
    FaExternalLinkAlt,
    FaBriefcase,
    FaCalendarCheck,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaInfoCircle,
} from "react-icons/fa";
import { UserDataContext } from "../../context/UserContext";
import {
    getCandidateInterviews,
    getCandidateUpcomingInterviews,
} from "../../services/JobService";
import { useToast } from "../../components/Toast";

const STATUS_STYLES = {
    SCHEDULED: { label: "Scheduled", bg: "bg-blue-100", text: "text-blue-700", icon: <FaCalendarCheck className="text-blue-600" /> },
    COMPLETED: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: <FaCheckCircle className="text-green-600" /> },
    CANCELLED: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", icon: <FaTimes className="text-red-600" /> },
};

const MODE_ICONS = {
    VIDEO_CALL: <FaVideo />,
    PHONE: <FaPhone />,
    IN_PERSON: <FaBuilding />,
};

const CandidateInterviews = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { userData } = useContext(UserDataContext);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("upcoming");

    useEffect(() => {
        fetchInterviews();
    }, [filter]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const data = filter === "upcoming"
                ? await getCandidateUpcomingInterviews()
                : await getCandidateInterviews();
            setInterviews(data);
        } catch (error) {
            console.error("Error fetching interviews:", error);
            addToast("Failed to load interviews. Please try again.", "error");
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors">
                        <FaArrowLeft className="text-sm" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">My Interviews</h1>
                    <p className="text-blue-100 mt-3 text-lg">View and manage all your scheduled interviews.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-3 mb-8">
                    <button onClick={() => setFilter("upcoming")}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === "upcoming" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"}`}>
                        Upcoming
                    </button>
                    <button onClick={() => setFilter("all")}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === "all" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"}`}>
                        All Interviews
                    </button>
                </div>

                {/* Interview List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <FaCalendarAlt className="text-3xl text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">No Interviews</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            {filter === "upcoming"
                                ? "You have no upcoming interviews. Once a recruiter schedules an interview with you, it will appear here."
                                : "No interviews found yet."}
                        </p>
                        <button onClick={() => navigate("/dashboard")}
                            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                            Browse Jobs
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
                                    className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all ${today ? "ring-2 ring-blue-400" : ""} ${past ? "opacity-70" : ""}`}>
                                    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                        <div className="flex items-start gap-4 min-w-0 flex-1">
                                            {/* Job Icon */}
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                                                <FaBriefcase className="text-xl" />
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-gray-800 truncate">{interview.jobTitle}</h3>
                                                    {today && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Today</span>}
                                                    {past && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                                                    <FaBuilding className="text-blue-500 text-xs" />
                                                    <span className="font-medium">{interview.companyName || "Company"}</span>
                                                </p>

                                                {/* Date & Time */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <FaCalendarAlt className="text-blue-500 text-xs" />
                                                        {formatDate(interview.interviewDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <FaClock className="text-blue-500 text-xs" />
                                                        {formatTime(interview.interviewTime)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <span className="text-blue-500 text-xs">{modeIcon}</span>
                                                        {interview.interviewMode?.replace(/_/g, " ") || "—"}
                                                    </span>
                                                </div>

                                                {/* Join Link */}
                                                {interview.interviewLink && interview.status === "SCHEDULED" && (
                                                    <a href={interview.interviewLink} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
                                                        <FaVideo /> Join Interview <FaExternalLinkAlt className="text-xs" />
                                                    </a>
                                                )}

                                                {/* Notes */}
                                                {interview.notes && (
                                                    <div className="flex items-start gap-2 mt-3 text-sm text-gray-500 bg-slate-50 rounded-xl p-3">
                                                        <FaInfoCircle className="text-blue-400 mt-0.5 shrink-0" />
                                                        <span>{interview.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                {statusStyle.icon}
                                                {statusStyle.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateInterviews;
