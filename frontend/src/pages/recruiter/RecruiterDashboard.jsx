import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaEye,
    FaBriefcase,
    FaUsers,
    FaUserCheck,
    FaCalendarCheck,
    FaPlus,
    FaClipboardList,
    FaChartLine,
    FaBookmark,
    FaBuilding,
    FaArrowRight,
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaMapMarkerAlt,
    FaCalendarAlt
} from "react-icons/fa";

import { UserDataContext } from "../../context/UserContext";
import { getRecruiterDashboard } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  REVIEWING: { label: "Reviewing", bg: "bg-blue-100", text: "text-blue-700" },
  INTERVIEWING: { label: "Interviewing", bg: "bg-purple-100", text: "text-purple-700" },
  ACCEPTED: { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  WITHDRAWN: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-700" },
};

const RecruiterDashboard = () => {

    const { userData } = useContext(UserDataContext);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const data = await getRecruiterDashboard();
            setDashboard(data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
            addToast("Failed to load dashboard data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatJobType = (type) =>
        type ? type.replace(/_/g, " ") : "-";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { title: "Jobs Posted", value: dashboard?.totalJobsPosted ?? 0, growth: "Active listings", icon: <FaBriefcase />, bg: "bg-blue-50", text: "text-blue-600" },
        { title: "Applications", value: dashboard?.totalApplications ?? 0, growth: "Total received", icon: <FaFileAlt />, bg: "bg-green-50", text: "text-green-600" },
        { title: "Shortlisted", value: dashboard?.shortlistedCount ?? 0, growth: "Under review", icon: <FaUserCheck />, bg: "bg-purple-50", text: "text-purple-600" },
        { title: "Interviews", value: dashboard?.interviewingCount ?? 0, growth: "Scheduled", icon: <FaCalendarCheck />, bg: "bg-orange-50", text: "text-orange-600" },
        { title: "Accepted", value: dashboard?.acceptedCount ?? 0, growth: "Offers sent", icon: <FaCheckCircle />, bg: "bg-pink-50", text: "text-pink-600" },
        { title: "Rejected", value: dashboard?.rejectedCount ?? 0, growth: "Not proceeding", icon: <FaTimesCircle />, bg: "bg-red-50", text: "text-red-600" },
    ];

    const quickActions = [
        { title: "Post Job", icon: <FaPlus />, color: "bg-blue-600", path: "/hire/post-job" },
        { title: "Manage Jobs", icon: <FaClipboardList />, color: "bg-green-600", path: "/hire/jobs" },
        { title: "Applicants", icon: <FaUsers />, color: "bg-purple-600", path: "/hire/jobs" },
        { title: "Interviews", icon: <FaCalendarAlt />, color: "bg-orange-600", path: "/hire/interviews" },
        { title: "Analytics", icon: <FaChartLine />, color: "bg-pink-600", path: "/hire/analytics" },
        { title: "Saved Candidates", icon: <FaBookmark />, color: "bg-cyan-600", path: "/hire/saved-candidates" },
        { title: "Company Profile", icon: <FaBuilding />, color: "bg-indigo-600", path: "/hire/profile" },
    ];

    const totalApps = dashboard?.totalApplications || 1;
    const pipelineStages = [
        { label: "Applications", value: dashboard?.totalApplications ?? 0, pct: 100, barColor: "bg-blue-600" },
        { label: "Shortlisted", value: dashboard?.shortlistedCount ?? 0, pct: totalApps > 0 ? Math.round(((dashboard?.shortlistedCount ?? 0) / totalApps) * 100) : 0, barColor: "bg-purple-500" },
        { label: "Interviews", value: dashboard?.interviewingCount ?? 0, pct: totalApps > 0 ? Math.round(((dashboard?.interviewingCount ?? 0) / totalApps) * 100) : 0, barColor: "bg-orange-500" },
        { label: "Accepted", value: dashboard?.acceptedCount ?? 0, pct: totalApps > 0 ? Math.round(((dashboard?.acceptedCount ?? 0) / totalApps) * 100) : 0, barColor: "bg-green-500" },
    ];

    const recentJobs = dashboard?.recentJobs || [];
    const recentApplicants = dashboard?.recentApplicants || [];

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-lg">

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

                    <div>
                        <p className="uppercase tracking-[4px] text-blue-100 text-sm">
                            Recruiter Dashboard
                        </p>

                        <h1 className="text-4xl md:text-5xl font-bold mt-4">
                            Welcome back 👋
                        </h1>

                        <p className="text-blue-100 mt-4 text-lg">
                            {userData?.email || "Recruiter"}
                        </p>

                        <p className="text-blue-100 mt-3 max-w-2xl">
                            You have {dashboard?.totalApplications ?? 0} total application{dashboard?.totalApplications !== 1 ? "s" : ""} across {dashboard?.totalJobsPosted ?? 0} job{dashboard?.totalJobsPosted !== 1 ? "s" : ""}.
                        </p>

                        <div className="flex gap-4 mt-8 flex-wrap">
                            <button
                                onClick={() => navigate("/hire/post-job")}
                                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Post New Job
                            </button>

                            <button
                                onClick={() => navigate("/hire/jobs")}
                                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
                            >
                                View Jobs
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <FaBriefcase className="text-7xl text-white/80" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

                {stats.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start">

                            <div>
                                <p className="text-gray-500 text-sm font-medium">
                                    {item.title}
                                </p>

                                <h2 className="text-4xl font-bold mt-3 text-gray-800">
                                    {item.value}
                                </h2>

                                <p className="text-green-600 text-sm mt-3">
                                    {item.growth}
                                </p>
                            </div>

                            <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center text-2xl ${item.text}`}>
                                {item.icon}
                            </div>

                        </div>
                    </div>
                ))}

            </div>

            {/* Quick Actions */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-5">

                    {quickActions.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-center"
                        >
                            <div className={`w-14 h-14 mx-auto rounded-2xl ${item.color} text-white flex items-center justify-center text-xl`}>
                                {item.icon}
                            </div>

                            <p className="mt-4 font-medium text-gray-700">
                                {item.title}
                            </p>
                        </div>
                    ))}

                </div>
            </div>

            {/* Middle Section */}
            <div className="grid lg:grid-cols-2 gap-8 mt-10">

                {/* Hiring Pipeline */}
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-8">Hiring Pipeline</h2>
                    <div className="space-y-8">
                        {pipelineStages.map((stage, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-700 font-medium">{stage.label}</span>
                                    <span className="text-gray-900 font-bold">{stage.value}</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-3 rounded-full transition-all duration-700 ${stage.barColor}`} style={{ width: `${stage.pct}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Applicants */}
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Latest Applicants</h2>
                        <button onClick={() => navigate("/hire/jobs")} className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-all text-sm">View All <FaArrowRight /></button>
                    </div>
                    {recentApplicants.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FaUsers className="text-4xl mx-auto mb-3" />
                            <p>No applicants yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentApplicants.map((applicant) => {
                                const config = statusConfig[applicant.status] || statusConfig.PENDING;
                                return (
                                    <div key={applicant.applicationId} onClick={() => navigate(`/hire/jobs/${applicant.jobId}/applicants/${applicant.applicationId}`)}
                                        className="bg-slate-50 hover:bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {applicant.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-800 text-sm truncate">{applicant.fullName || "Unknown"}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{applicant.jobTitle}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(applicant.applicationDate)}</p>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-8 mt-8">

                {/* Recent Jobs */}
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Recent Jobs</h2>
                            <p className="text-gray-500 text-sm mt-1">Your latest job postings.</p>
                        </div>
                        <button onClick={() => navigate("/hire/jobs")} className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-all text-sm">View All <FaArrowRight /></button>
                    </div>
                    {recentJobs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FaBriefcase className="text-4xl mx-auto mb-3" />
                            <p>No jobs posted yet</p>
                            <button onClick={() => navigate("/hire/post-job")} className="mt-4 text-blue-600 font-medium text-sm hover:underline">Post your first job →</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentJobs.map((job) => (
                                <div key={job.id} onClick={() => navigate(`/hire/jobs/${job.id}`)}
                                    className="bg-slate-50 hover:bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-800 truncate">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" />{job.location || "—"}</span>
                                                <span>•</span>
                                                <span>{formatJobType(job.jobType)}</span>
                                                <span>•</span>
                                                <span>{job.totalApplicants} Applicant{job.totalApplicants !== 1 ? "s" : ""}</span>
                                            </div>
                                        </div>
                                        <span className="shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-xs text-gray-400">Posted {job.createdAt ? formatDate(job.createdAt) : "—"}</p>
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/hire/jobs/${job.id}`); }}
                                            className="flex items-center gap-1.5 text-blue-600 font-medium hover:text-blue-700 text-xs"><FaEye /> View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Interviews */}
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Upcoming Interviews</h2>
                            <p className="text-gray-500 text-sm mt-1">Candidates moved to interview stage.</p>
                        </div>
                        <button onClick={() => navigate("/hire/jobs")} className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-all text-sm">View All <FaArrowRight /></button>
                    </div>
                    {(dashboard?.upcomingInterviews ?? []).length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FaCalendarAlt className="text-4xl mx-auto mb-3" />
                            <p>No upcoming interviews</p>
                            <p className="text-xs mt-2">Move applicants to Interviewing stage to see them here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboard.upcomingInterviews.map((interview) => (
                                <div key={interview.applicationId} onClick={() => navigate(`/hire/jobs/${interview.jobId}/applicants/${interview.applicationId}`)}
                                    className="bg-slate-50 hover:bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {interview.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-800 text-sm truncate">{interview.fullName || "Unknown"}</h3>
                                                <p className="text-xs text-gray-500 truncate">{interview.jobTitle}</p>
                                                {interview.statusUpdatedAt && (
                                                    <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                                                        <FaCalendarAlt className="text-[10px]" />
                                                        Moved to interview: {formatDate(interview.statusUpdatedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Interviewing</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default RecruiterDashboard;