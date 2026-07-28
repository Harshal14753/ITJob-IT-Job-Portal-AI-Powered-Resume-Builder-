import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaSpinner,
    FaCommentDots,
    FaUser,
    FaSearch,
    FaCheckDouble,
    FaTrash,
} from "react-icons/fa";
import { useToast } from "../../components/Toast";
import ChatWindow from "../../components/ChatWindow";
import {
    getRecruiterConversations,
    getRecruiterMessages,
    sendRecruiterMessage,
    markRecruiterConversationAsRead,
    createOrGetConversation,
} from "../../services/MessageService";

const RecruiterMessages = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showMobileList, setShowMobileList] = useState(true);

    const fetchConversations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRecruiterConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations:", error);
            addToast("Failed to load conversations.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchConversations();
        // Poll for new conversations/unread counts every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Start a new conversation from URL parameter (?start=candidateId)
    useEffect(() => {
        const startCandidateId = searchParams.get("start");
        if (startCandidateId && conversations.length > 0) {
            const existing = conversations.find((c) => c.otherUserId === startCandidateId);
            if (existing) {
                handleSelectConversation(existing);
            } else {
                startNewConversation(startCandidateId);
            }
            // Clean up the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [conversations, searchParams]);

    const startNewConversation = async (candidateId) => {
        try {
            const conv = await createOrGetConversation(candidateId);
            setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
            setSelectedConv(conv);
            setShowMobileList(false);
            setMessages([]);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            addToast("Failed to start conversation.", "error");
        }
    };

    // Poll messages every 5 seconds when a conversation is selected
    useEffect(() => {
        if (!selectedConv) return;
        const interval = setInterval(() => {
            fetchMessages(selectedConv.id, true);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedConv?.id]);

    const fetchMessages = async (convId, silent = false) => {
        if (!silent) setMessagesLoading(true);
        try {
            const data = await getRecruiterMessages(convId, 0, 100);
            setMessages(data.content || []);
        } catch (error) {
            console.error("Failed to load messages:", error);
            if (!silent) addToast("Failed to load messages.", "error");
        } finally {
            if (!silent) setMessagesLoading(false);
        }
    };

    const handleSelectConversation = async (conv) => {
        setSelectedConv(conv);
        setShowMobileList(false);
        await fetchMessages(conv.id);
        await markRecruiterConversationAsRead(conv.id);
        // Refresh conversations to update unread counts
        fetchConversations();
    };

    const handleSendMessage = async (content) => {
        if (!selectedConv) return;
        const newMsg = await sendRecruiterMessage(selectedConv.id, content);
        setMessages((prev) => [...prev, newMsg]);
        // Optimistically update last message in conversation list
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConv.id
                    ? { ...c, lastMessage: content.length > 100 ? content.substring(0, 100) + "..." : content, lastMessageAt: new Date().toISOString() }
                    : c
            )
        );
    };

    const handleMarkRead = async (convId) => {
        await markRecruiterConversationAsRead(convId);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()
        ) {
            return "Yesterday";
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    };

    const filteredConversations = conversations.filter((c) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            c.otherUserName?.toLowerCase().includes(term) ||
            c.otherUserEmail?.toLowerCase().includes(term) ||
            c.lastMessage?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => navigate("/hire/dashboard")}
                        className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <FaCommentDots className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Messages</h1>
                            <p className="text-blue-100 mt-1">
                                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[500px]">
                    {/* Conversation List */}
                    <div
                        className={`w-full lg:w-96 shrink-0 ${
                            !showMobileList ? "hidden lg:block" : ""
                        }`}
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center bg-gray-100 rounded-xl px-4 h-10">
                                    <FaSearch className="text-gray-400 mr-3 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full outline-none bg-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <FaCommentDots className="text-gray-300 text-4xl mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">
                                            {search
                                                ? "No conversations match your search."
                                                : "No conversations yet. Start one from a candidate's profile!"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredConversations.map((conv) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`w-full text-left px-4 py-4 hover:bg-blue-50 transition flex items-start gap-3 ${
                                                    selectedConv?.id === conv.id
                                                        ? "bg-blue-50"
                                                        : ""
                                                }`}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                                        conv.otherUserRole === "RECRUITER"
                                                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                    }`}
                                                >
                                                    {conv.otherUserAvatar || (
                                                        <FaUser className="text-xs" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                                                            {conv.otherUserName}
                                                        </h3>
                                                        {conv.lastMessageAt && (
                                                            <span className="text-[10px] text-gray-400 shrink-0">
                                                                {formatTime(conv.lastMessageAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {conv.otherUserEmail}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {conv.unreadCount > 0 && (
                                                            <span className="text-blue-600 shrink-0">
                                                                <FaCheckDouble className="text-[10px]" />
                                                            </span>
                                                        )}
                                                        <p
                                                            className={`text-xs truncate ${
                                                                conv.unreadCount > 0
                                                                    ? "text-gray-900 font-medium"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {conv.lastMessage || "No messages yet"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                        {conv.unreadCount > 99
                                                            ? "99+"
                                                            : conv.unreadCount}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div
                        className={`flex-1 ${
                            showMobileList ? "hidden lg:flex" : ""
                        }`}
                    >
                        <ChatWindow
                            conversation={selectedConv}
                            messages={messages}
                            loading={messagesLoading}
                            onSendMessage={handleSendMessage}
                            onBack={() => {
                                setSelectedConv(null);
                                setShowMobileList(true);
                            }}
                            onMarkRead={handleMarkRead}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterMessages;
