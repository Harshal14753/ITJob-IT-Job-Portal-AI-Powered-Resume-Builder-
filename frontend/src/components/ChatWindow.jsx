import React, { useState, useEffect, useRef } from "react";
import {
    FaPaperPlane,
    FaSpinner,
    FaUser,
    FaBuilding,
    FaArrowLeft,
} from "react-icons/fa";

const ChatWindow = ({
    conversation,
    messages,
    loading,
    onSendMessage,
    onBack,
    onMarkRead,
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, [conversation?.id]);

    // Mark as read when conversation opens
    useEffect(() => {
        if (conversation?.id && onMarkRead) {
            onMarkRead(conversation.id);
        }
    }, [conversation?.id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await onSendMessage(newMessage.trim());
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
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
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isYesterday) {
            return "Yesterday " + date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl">
                <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <FaPaperPlane className="text-blue-500 text-3xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">Select a conversation</h3>
                    <p className="text-sm text-gray-500 mt-2">Choose a conversation from the left to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white shrink-0">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition mr-1"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                )}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        conversation.otherUserRole === "RECRUITER"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                >
                    {conversation.otherUserRole === "RECRUITER" ? (
                        <FaBuilding />
                    ) : (
                        <FaUser />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.otherUserName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                        {conversation.otherUserRole === "RECRUITER"
                            ? "Recruiter"
                            : "Candidate"}{" "}
                        · {conversation.otherUserEmail}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                            <FaPaperPlane className="text-blue-400 text-xl" />
                        </div>
                        <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                    msg.mine
                                        ? "bg-blue-600 text-white rounded-br-md"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                <div
                                    className={`flex items-center gap-1 mt-1 ${
                                        msg.mine ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <span
                                        className={`text-[10px] ${
                                            msg.mine ? "text-blue-200" : "text-gray-400"
                                        }`}
                                    >
                                        {formatTime(msg.sentAt)}
                                    </span>
                                    {msg.mine && msg.readAt && (
                                        <span className="text-[10px] text-blue-200">✓✓</span>
                                    )}
                                    {msg.mine && !msg.readAt && (
                                        <span className="text-[10px] text-blue-200">✓</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 outline-none transition-all text-sm"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        {sending ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <FaPaperPlane className="text-sm" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
