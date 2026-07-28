import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaUsers,
    FaSearch,
    FaTrash,
    FaUserGraduate,
    FaUserTie,
    FaUserShield,
    FaSpinner,
    FaEnvelope,
    FaBuilding,
} from "react-icons/fa";
import { getAdminUsers, deleteAdminUser } from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const roleConfig = {
    CANDIDATE: { label: "Candidate", icon: <FaUserGraduate />, bg: "bg-green-500/20", text: "text-green-400" },
    RECRUITER: { label: "Recruiter", icon: <FaUserTie />, bg: "bg-blue-500/20", text: "text-blue-400" },
    ADMIN: { label: "Admin", icon: <FaUserShield />, bg: "bg-purple-500/20", text: "text-purple-400" },
};

const AdminUsers = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAdminUsers(search || undefined);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            addToast("Failed to load users.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleDelete = async () => {
        if (!deleteModal.user) return;
        setDeleting(true);
        try {
            await deleteAdminUser(deleteModal.user.id);
            setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user.id));
            setDeleteModal({ show: false, user: null });
            addToast("User deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting user:", error);
            addToast("Failed to delete user.", "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 border-b border-slate-600">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-blue-300 hover:text-white transition mb-4">
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                            <FaUsers className="text-2xl text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">User Management</h1>
                            <p className="text-blue-300 mt-1">{users.length} user{users.length !== 1 ? "s" : ""} on the platform</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <form onSubmit={handleSearch} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center border border-slate-600 rounded-xl px-4 h-12 transition bg-slate-700/50">
                            <FaSearch className="text-slate-400 mr-3 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full outline-none bg-transparent text-white placeholder-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Users List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-400 text-4xl" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                        <FaUsers className="text-slate-600 text-5xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">No Users Found</h3>
                        <p className="text-sm text-slate-400 mt-2">Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => {
                            const config = roleConfig[user.role] || roleConfig.CANDIDATE;
                            return (
                                <div key={user.id} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-600 transition p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center text-lg ${config.text}`}>
                                                {config.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white">{user.fullName || "N/A"}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1"><FaEnvelope className="text-xs text-slate-500" />{user.email}</span>
                                                    {user.companyName && (
                                                        <span className="flex items-center gap-1"><FaBuilding className="text-xs text-slate-500" />{user.companyName}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {user.profileCompleted ? "Profile completed" : "Profile not completed"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, user })}
                                            disabled={user.role === "ADMIN"}
                                            className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Delete User"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, user: null })}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                            <p className="text-slate-400 text-sm mb-1">Are you sure you want to delete this user?</p>
                            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
                            {deleteModal.user && (
                                <div className="bg-slate-700/50 rounded-lg px-4 py-3 w-full mb-6">
                                    <p className="font-semibold text-white">{deleteModal.user.email}</p>
                                    <p className="text-sm text-slate-400">{deleteModal.user.role}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ show: false, user: null })} disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition disabled:opacity-50">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {deleting ? <><FaSpinner className="animate-spin" /> Deleting...</> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
