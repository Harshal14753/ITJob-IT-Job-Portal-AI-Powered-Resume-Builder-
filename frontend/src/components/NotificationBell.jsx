import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaCheckDouble,
    FaCommentDots,
    FaCheckCircle,
    FaCalendarAlt,
    FaInfoCircle,
} from "react-icons/fa";
import {
    getUnreadNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/NotificationService";

const typeIcons = {
    MESSAGE: <FaCommentDots className="text-blue-500" />,
    APPLICATION_STATUS: <FaCheckCircle className="text-green-500" />,
    INTERVIEW: <FaCalendarAlt className="text-purple-500" />,
    SYSTEM: <FaInfoCircle className="text-orange-500" />,
};

const typeColors = {
    MESSAGE: "bg-blue-100",
    APPLICATION_STATUS: "bg-green-100",
    INTERVIEW: "bg-purple-100",
    SYSTEM: "bg-orange-100",
};

const NotificationBell = ({ role }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const [notifList, count] = await Promise.all([
                getUnreadNotifications(),
                getUnreadNotificationCount(),
            ]);
            setNotifications(notifList);
            setUnreadCount(count);
        } catch (e) {
            // Silently fail
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        setOpen(!open);
        if (!open) fetchData();
    };

    const handleMarkAsRead = async (notifId) => {
        try {
            await markNotificationAsRead(notifId);
            setNotifications((prev) => prev.filter((n) => n.id !== notifId));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
            console.error("Failed to mark as read:", e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications([]);
            setUnreadCount(0);
        } catch (e) {
            console.error("Failed to mark all as read:", e);
        }
    };

    const handleNotificationClick = (notif) => {
        // Navigate based on reference type
        if (notif.referenceType === "conversation") {
            const messagesPath = role === "RECRUITER" ? "/hire/messages" : "/messages";
            navigate(messagesPath);
        } else if (notif.referenceType === "application" && notif.referenceId) {
            // referenceId could be applicationId or jobId
            navigate(role === "RECRUITER" ? `/hire/jobs` : `/applications`);
        } else if (notif.referenceType === "interview") {
            navigate(role === "RECRUITER" ? "/hire/interviews" : "/interviews");
        }
        setOpen(false);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-all"
                title="Notifications"
            >
                <FaBell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <FaBell className="text-gray-300 text-3xl mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className="flex items-start gap-3 px-5 py-4 hover:bg-blue-50 transition cursor-pointer"
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                typeColors[notif.type] || "bg-gray-100"
                                            }`}
                                        >
                                            {typeIcons[notif.type] || <FaInfoCircle className="text-gray-500" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {notif.title}
                                            </p>
                                            {notif.message && (
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {formatTime(notif.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notif.id);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition shrink-0 mt-1"
                                            title="Mark as read"
                                        >
                                            <FaCheckDouble className="text-xs text-gray-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
