import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaQuestionCircle,
    FaUserCircle,
    FaCalendarAlt,
    FaCommentDots,
} from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";
import { SiteConfigContext } from "../context/SiteConfigContext";
import { getRecruiterUnreadCount, getCandidateUnreadCount } from "../services/MessageService";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
    const navigate = useNavigate();

    const {
        isCandidate,
        isAuthenticated,
        userData
    } = useContext(UserDataContext);

    const { websiteName } = useContext(SiteConfigContext);

    const role = localStorage.getItem("role");

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const count = role === "RECRUITER"
                    ? await getRecruiterUnreadCount()
                    : role === "CANDIDATE"
                        ? await getCandidateUnreadCount()
                        : 0;
                setUnreadCount(count);
            } catch (e) {
                // Silently fail — not critical
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [role]);

    // Admin navigation
    if (role === "ADMIN") {
        return (
            <nav className="h-16 px-6 lg:px-8 flex justify-between items-center bg-slate-900 border-b border-slate-700 text-white">
                <div className="flex items-center gap-8">
                    <div className="cursor-pointer flex flex-col justify-center leading-none shrink-0" onClick={() => navigate("/admin")}>
                        <h1 className="text-2xl font-bold m-0 text-blue-400">{websiteName}</h1>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-purple-400">Admin Panel</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-5">
                        <Link to="/admin" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Dashboard</Link>
                        <Link to="/admin/users" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Users</Link>
                        <Link to="/admin/jobs" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Jobs</Link>
                        <Link to="/admin/skills" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Skills</Link>
                        <Link to="/admin/contacts" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Contacts</Link>
                        <Link to="/admin/config" className="text-sm font-medium text-gray-300 hover:text-white transition-all">Settings</Link>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("role");
                        localStorage.removeItem("profileCompleted");
                        localStorage.removeItem("userData");
                        navigate("/");
                    }} className="border border-red-400 text-red-400 px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition text-xs font-medium">
                        Logout
                    </button>
                </div>
            </nav>
        );
    }

    const candidateLinks = [
        { title: "Home", path: "/" },
        { title: "Find Jobs", path: "/dashboard" },
        { title: "My Applications", path: "/applications" },
        { title: "My Interviews", path: "/interviews" },
        { title: "Messages", path: "/messages", badge: unreadCount },
        { title: "AI Auto-Apply", path: "/ai-auto-apply" },
        { title: "Company Reviews", path: "/company-reviews" },
        { title: "Salary Guide", path: "/salary-guide" },
        { title: "Contact Us", path: "/contact" },
    ];

    const recruiterLinks = [
        { title: "Post a Job", path: "/hire/post-job" },
        { title: "Find CVs", path: "/hire/find-cvs" },
        { title: "Products", path: "/hire/products" },
        { title: "Messages", path: "/hire/messages", badge: unreadCount },
        { title: "Pricing", path: "/hire/pricing" },
        { title: "Contact Us", path: "/contact" },
    ];
    const showProfile = isAuthenticated && ((role === "CANDIDATE" && isCandidate) || (role === "RECRUITER" && !isCandidate));

    const handleLogoClick = () => {
        if (isAuthenticated && role === "CANDIDATE" && isCandidate) {
            navigate("/dashboard");
            return;
        }

        if (isAuthenticated && role === "RECRUITER" && !isCandidate) {
            navigate("/hire/dashboard");
            return;
        }

        navigate(isCandidate ? "/" : "/hire");
    };

    const handleJobSeekerClick = () => {
        if (isAuthenticated && role === "CANDIDATE") {
            navigate("/dashboard");
            return;
        }

        navigate("/");
    };

    const handleEmployerClick = () => {
        if (isAuthenticated && role === "RECRUITER") {
            navigate("/hire/dashboard");
            return;
        }

        navigate("/hire");
    };

    const handleSignInClick = () => {
        navigate(isCandidate ? "/login" : "/hire/login");
    };

    const handleProfileClick = () => {
        if (role === "RECRUITER") {
            navigate("/hire/profile");
        } else {
            navigate("/profile");
        }
    };

    return (
        <nav
            className={`h-16 px-6 lg:px-8 flex justify-between items-center transition-all duration-300 ${
                isCandidate
                    ? "bg-white border-b border-gray-200 text-gray-800"
                    : "bg-[#1f4fbf] text-white"
            }`}
        >
            {/* Left Section */}
            <div className="flex items-center gap-6">

                {/* Logo */}
                <div
                    className="cursor-pointer flex flex-col justify-center leading-none shrink-0"
                    onClick={handleLogoClick}
                >
                    <h1
                        className={`text-3xl font-bold m-0 ${
                            isCandidate
                                ? "text-[#2557A7]"
                                : "text-white"
                        }`}
                    >
                        {websiteName}
                    </h1>

                    <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isCandidate
                                ? "text-[#2557A7]"
                                : "text-white"
                        }`}
                    >
                        {isCandidate
                            ? "For Candidates"
                            : "For Employers"}
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-5">
                    {(isCandidate
                        ? candidateLinks
                        : recruiterLinks
                    ).map((item) => (
                        <Link
                            key={item.title}
                            to={item.path}
                            className={`text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                                isCandidate
                                    ? "text-gray-700 hover:text-[#2557A7]"
                                    : "text-white hover:text-gray-200"
                            }`}
                        >
                            {item.title}
                            {item.badge > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isCandidate
                                        ? "bg-red-500 text-white"
                                        : "bg-red-500 text-white"
                                }`}>
                                    {item.badge > 99 ? "99+" : item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">

                {!isCandidate ? (
                    <>
                        <button
                            onClick={() => navigate("/help")}
                            className="flex items-center gap-1.5 hover:text-gray-200 transition text-sm"
                        >
                            <FaQuestionCircle size={15} />
                            <span>Help</span>
                        </button>

                        {/* Sign In or Profile */}
                        {showProfile ? (
                            <div className="flex items-center gap-1.5">
                                <NotificationBell role={role} />
                                <button
                                    onClick={handleProfileClick}
                                    className="hover:text-gray-200 transition"
                                >
                                    <div className="w-9 h-9 rounded-full bg-white text-[#1f4fbf] flex items-center justify-center font-bold text-base shadow-sm">
                                        {userData?.email?.charAt(0).toUpperCase() || (
                                            <FaUserCircle size={20} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSignInClick}
                                className="border border-white px-4 py-1.5 rounded-md hover:bg-white hover:text-[#1f4fbf] transition text-sm font-medium"
                            >
                                Sign In
                            </button>
                        )}

                        <button
                            onClick={() => navigate("/hire/post-job")}
                            className="bg-white text-[#1f4fbf] px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition"
                        >
                            Post a Job
                        </button>

                        <button
                            onClick={handleJobSeekerClick}
                            className="border-l border-white/30 pl-4 text-sm hover:text-gray-200 transition"
                        >
                            For Jobseekers
                        </button>
                    </>
                ) : (
                    <>
                        {/* Sign In or Profile */}
                        {showProfile ? (
                            <div className="flex items-center gap-1.5">
                                <NotificationBell role={role} />
                                <button
                                    onClick={() => navigate("/interviews")}
                                    className="p-1.5 rounded-lg bg-blue-50 text-[#2557A7] hover:bg-blue-100 transition-all group"
                                    title="My Interviews"
                                >
                                    <FaCalendarAlt size={15} />
                                </button>
                                <button
                                    onClick={handleProfileClick}
                                    className="hover:scale-105 transition-all duration-200"
                                >
                                    <div className="w-9 h-9 rounded-full bg-[#2557A7] text-white flex items-center justify-center font-bold text-base shadow-sm">
                                        {userData?.email?.charAt(0).toUpperCase() || (
                                            <FaUserCircle size={20} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSignInClick}
                                className="text-[#2557A7] text-sm font-semibold hover:underline"
                            >
                                Sign In
                            </button>
                        )}

                        <button
                            onClick={handleEmployerClick}
                            className="border-l border-gray-200 pl-4 text-sm hover:text-[#2557A7] transition"
                        >
                            Employers / Post Job
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;