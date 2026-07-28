import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUsers,
    FaBriefcase,
    FaFileAlt,
    FaUserTie,
    FaUserGraduate,
    FaFolderOpen,
    FaEnvelope,
    FaClock,
    FaChartLine,
    FaSpinner,
    FaCog,
    FaStar,
    FaHourglassHalf,
    FaRobot,
} from "react-icons/fa";
import { getAdminDashboard } from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const AdminDashboard = () => {
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
            const data = await getAdminDashboard();
            setDashboard(data);
        } catch (error) {
            console.error("Error fetching admin dashboard:", error);
            addToast("Failed to load dashboard data.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-400">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            label: "Total Users",
            value: dashboard?.totalUsers ?? 0,
            icon: <FaUsers />,
            color: "from-blue-500 to-blue-700",
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            path: "/admin/users",
        },
        {
            label: "Candidates",
            value: dashboard?.totalCandidates ?? 0,
            icon: <FaUserGraduate />,
            color: "from-green-500 to-green-700",
            bg: "bg-green-500/10",
            text: "text-green-400",
            path: "/admin/users",
        },
        {
            label: "Recruiters",
            value: dashboard?.totalRecruiters ?? 0,
            icon: <FaUserTie />,
            color: "from-purple-500 to-purple-700",
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            path: "/admin/users",
        },
        {
            label: "Total Jobs",
            value: dashboard?.totalJobs ?? 0,
            icon: <FaBriefcase />,
            color: "from-orange-500 to-orange-700",
            bg: "bg-orange-500/10",
            text: "text-orange-400",
            path: "/admin/jobs",
        },
        {
            label: "Applications",
            value: dashboard?.totalApplications ?? 0,
            icon: <FaFileAlt />,
            color: "from-pink-500 to-pink-700",
            bg: "bg-pink-500/10",
            text: "text-pink-400",
            path: "/admin/jobs",
        },
        {
            label: "Skills",
            value: dashboard?.totalSkills ?? 0,
            icon: <FaStar />,
            color: "from-indigo-500 to-indigo-700",
            bg: "bg-indigo-500/10",
            text: "text-indigo-400",
            path: "/admin/skills",
        },
        {
            label: "Contacts",
            value: dashboard?.totalContacts ?? 0,
            icon: <FaEnvelope />,
            color: "from-cyan-500 to-cyan-700",
            bg: "bg-cyan-500/10",
            text: "text-cyan-400",
            path: "/admin/contacts",
        },
        {
            label: "Pending",
            value: dashboard?.pendingContacts ?? 0,
            icon: <FaClock />,
            color: "from-red-500 to-red-700",
            bg: "bg-red-500/10",
            text: "text-red-400",
            path: "/admin/contacts",
        },
        {
            label: "AI Auto-Applied",
            value: dashboard?.totalAutoAppliedJobs ?? 0,
            icon: <FaRobot />,
            color: "from-fuchsia-500 to-purple-700",
            bg: "bg-fuchsia-500/10",
            text: "text-fuchsia-400",
            path: "/admin/config",
        },
        {
            label: "Active AI Users",
            value: dashboard?.activeAutoApplyUsers ?? 0,
            icon: <FaRobot />,
            color: "from-violet-500 to-fuchsia-700",
            bg: "bg-violet-500/10",
            text: "text-violet-400",
            path: "/admin/config",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 border-b border-slate-600">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <FaCog className="text-3xl text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-blue-300 mt-1">Platform overview and management</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statsCards.map((card, i) => (
                        <div
                            key={i}
                            onClick={() => navigate(card.path)}
                            className={`${card.bg} rounded-2xl p-6 border border-transparent hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center text-xl`}>
                                    {card.icon}
                                </div>
                                <FaChartLine className={`${card.text} text-lg opacity-30`} />
                            </div>
                            <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
                            <p className="text-gray-500 text-sm mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h2 className="text-lg font-bold text-white mb-4">User Management</h2>
                        <p className="text-sm text-slate-400 mb-4">View, search, and manage all platform users.</p>
                        <button
                            onClick={() => navigate("/admin/users")}
                            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm"
                        >
                            Manage Users
                        </button>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h2 className="text-lg font-bold text-white mb-4">Job Moderation</h2>
                        <p className="text-sm text-slate-400 mb-4">Review and manage all job postings.</p>
                        <button
                            onClick={() => navigate("/admin/jobs")}
                            className="w-full px-4 py-2.5 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition text-sm"
                        >
                            Moderate Jobs
                        </button>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h2 className="text-lg font-bold text-white mb-4">Skills & Contacts</h2>
                        <p className="text-sm text-slate-400 mb-4">Manage the skills database and contact inquiries.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate("/admin/skills")}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-sm"
                            >
                                Skills
                            </button>
                            <button
                                onClick={() => navigate("/admin/contacts")}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition text-sm"
                            >
                                Contacts
                            </button>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 bg-gradient-to-r from-slate-800 to-gray-800 rounded-2xl p-6 border border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                        <FaChartLine className="text-blue-400 text-xl" />
                        <h2 className="text-lg font-bold text-white">Platform Health</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-blue-300 text-xs uppercase tracking-wider">Active Jobs</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.activeJobs ?? 0}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-orange-300 text-xs uppercase tracking-wider">Pending Approval</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.pendingJobs ?? 0}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-yellow-300 text-xs uppercase tracking-wider">Featured Jobs</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.featuredJobs ?? 0}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-red-300 text-xs uppercase tracking-wider">Closed Jobs</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.closedJobs ?? 0}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-green-300 text-xs uppercase tracking-wider">New Users/Week</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.newUsersThisWeek ?? 0}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <p className="text-purple-300 text-xs uppercase tracking-wider">Total Users</p>
                            <p className="text-2xl font-bold text-white mt-1">{dashboard?.totalUsers ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
