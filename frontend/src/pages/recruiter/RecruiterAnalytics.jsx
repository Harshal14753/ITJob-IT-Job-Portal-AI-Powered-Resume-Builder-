import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaBriefcase,
  FaFileAlt,
  FaUserCheck,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { getRecruiterDashboard } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const RecruiterAnalytics = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRecruiterDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      addToast("Failed to load analytics data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalApps = dashboard?.totalApplications || 0;
  const shortlisted = dashboard?.shortlistedCount || 0;
  const interviewing = dashboard?.interviewingCount || 0;
  const accepted = dashboard?.acceptedCount || 0;
  const rejected = dashboard?.rejectedCount || 0;
  const jobsPosted = dashboard?.totalJobsPosted || 0;

  const conversionRate = totalApps > 0 ? ((accepted / totalApps) * 100).toFixed(1) : "0.0";
  const shortlistRate = totalApps > 0 ? ((shortlisted / totalApps) * 100).toFixed(1) : "0.0";
  const interviewRate = shortlisted > 0 ? ((interviewing / shortlisted) * 100).toFixed(1) : "0.0";

  const overviewCards = [
    { label: "Jobs Posted", value: jobsPosted, icon: <FaBriefcase />, color: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Total Applications", value: totalApps, icon: <FaFileAlt />, color: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
    { label: "Shortlisted", value: shortlisted, icon: <FaUserCheck />, color: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
    { label: "Interviews", value: interviewing, icon: <FaCalendarCheck />, color: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
    { label: "Accepted", value: accepted, icon: <FaCheckCircle />, color: "bg-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
    { label: "Rejected", value: rejected, icon: <FaTimesCircle />, color: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
  ];

  const recentJobs = dashboard?.recentJobs || [];
  const recentApplicants = dashboard?.recentApplicants || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-lg mb-8">
        <button onClick={() => navigate("/hire/dashboard")} className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4">
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 className="text-3xl md:text-4xl font-bold">Analytics</h1>
        <p className="text-blue-100 mt-2">Track your hiring performance at a glance.</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {overviewCards.map((card, i) => (
            <div key={i} className={`${card.bg} rounded-2xl p-5 border border-transparent`}>
              <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Conversion Funnel */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Conversion Funnel</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Applications → Shortlisted</span>
                  <span className="font-semibold text-gray-800">{shortlistRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(parseFloat(shortlistRate), 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Shortlisted → Interviewed</span>
                  <span className="font-semibold text-gray-800">{interviewRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(parseFloat(interviewRate), 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Applications → Accepted</span>
                  <span className="font-semibold text-gray-800">{conversionRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">{totalApps}</p>
                <p className="text-xs text-blue-600 mt-1">Applied</p>
              </div>
              <div className="text-center bg-purple-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-purple-700">{interviewing}</p>
                <p className="text-xs text-purple-600 mt-1">Interviewed</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{accepted}</p>
                <p className="text-xs text-green-600 mt-1">Accepted</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            {recentApplicants.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentApplicants.slice(0, 5).map((app) => (
                  <div key={app.applicationId} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {app.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{app.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">Applied for {app.jobTitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(app.applicationDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Job Performance</h2>
          {recentJobs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No jobs posted yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Job Title</th>
                    <th className="text-center py-3 px-2 text-gray-500 font-medium">Applicants</th>
                    <th className="text-center py-3 px-2 text-gray-500 font-medium">Shortlisted</th>
                    <th className="text-center py-3 px-2 text-gray-500 font-medium">Interviews</th>
                    <th className="text-center py-3 px-2 text-gray-500 font-medium">Accepted</th>
                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/hire/jobs/${job.id}`)}>
                      <td className="py-4 px-2 font-medium text-gray-800">{job.title}</td>
                      <td className="py-4 px-2 text-center">{job.totalApplicants}</td>
                      <td className="py-4 px-2 text-center text-purple-600">—</td>
                      <td className="py-4 px-2 text-center text-orange-600">—</td>
                      <td className="py-4 px-2 text-center text-green-600">—</td>
                      <td className="py-4 px-2 text-right text-gray-400 text-xs">{job.createdAt ? formatDate(job.createdAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
