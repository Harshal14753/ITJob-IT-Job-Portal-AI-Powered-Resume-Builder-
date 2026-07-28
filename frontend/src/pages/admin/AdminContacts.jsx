import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaEnvelope,
    FaTrash,
    FaCheck,
    FaSpinner,
    FaUser,
    FaPhone,
    FaClock,
    FaCheckCircle,
    FaEye,
} from "react-icons/fa";
import { getAdminContacts, resolveAdminContact, deleteAdminContact } from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const AdminContacts = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingOnly, setPendingOnly] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, contact: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [pendingOnly]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const data = await getAdminContacts(pendingOnly);
            setContacts(data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            addToast("Failed to load contacts.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (contactId) => {
        try {
            await resolveAdminContact(contactId);
            setContacts((prev) => prev.map((c) =>
                c.id === contactId ? { ...c, resolved: true, resolvedAt: new Date().toISOString() } : c
            ));
            addToast("Contact resolved.", "success");
        } catch (error) {
            console.error("Error resolving contact:", error);
            addToast("Failed to resolve contact.", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.contact) return;
        setDeleting(true);
        try {
            await deleteAdminContact(deleteModal.contact.id);
            setContacts((prev) => prev.filter((c) => c.id !== deleteModal.contact.id));
            setDeleteModal({ show: false, contact: null });
            if (selectedContact?.id === deleteModal.contact.id) setSelectedContact(null);
            addToast("Contact deleted.", "success");
        } catch (error) {
            console.error("Error deleting contact:", error);
            addToast("Failed to delete contact.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 border-b border-slate-600">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-blue-300 hover:text-white transition mb-4">
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                                <FaEnvelope className="text-2xl text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Contact Inquiries</h1>
                                <p className="text-blue-300 mt-1">{contacts.length} message{contacts.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPendingOnly(!pendingOnly)}
                            className={`px-5 py-2.5 rounded-xl font-medium transition text-sm ${
                                pendingOnly
                                    ? "bg-cyan-600 text-white shadow-md"
                                    : "bg-white/10 text-blue-200 hover:bg-white/20 border border-slate-500"
                            }`}
                        >
                            {pendingOnly ? "Show All" : "Pending Only"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Contacts List */}
                    <div className={selectedContact ? "hidden lg:block" : ""}>
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <FaSpinner className="animate-spin text-blue-400 text-4xl" />
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                                <FaEnvelope className="text-slate-600 text-5xl mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white">No Messages</h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    {pendingOnly ? "No pending messages." : "No contact messages yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        className={`bg-slate-800 rounded-2xl border p-5 cursor-pointer transition hover:border-slate-600 ${
                                            selectedContact?.id === contact.id
                                                ? "border-cyan-500 ring-2 ring-cyan-500/30"
                                                : "border-slate-700"
                                        } ${contact.resolved ? "opacity-60" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white truncate">{contact.subject}</h3>
                                                    {!contact.resolved && (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                                    )}
                                                    {contact.resolved && (
                                                        <FaCheckCircle className="text-green-500 text-xs shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1 truncate">{contact.name} — {contact.email}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(contact.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact Detail */}
                    <div className={!selectedContact ? "hidden lg:flex lg:items-center lg:justify-center" : ""}>
                        {selectedContact ? (
                            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sticky top-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Message Details</h2>
                                    <button onClick={() => setSelectedContact(null)} className="text-slate-400 hover:text-white lg:hidden transition">✕</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaUser className="text-slate-500 w-4" />
                                        <span className="font-medium text-gray-200">{selectedContact.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaEnvelope className="text-slate-500 w-4" />
                                        <a href={`mailto:${selectedContact.email}`} className="text-blue-400 hover:underline">{selectedContact.email}</a>
                                    </div>
                                    {selectedContact.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FaPhone className="text-slate-500 w-4" />
                                            <span className="text-slate-300">{selectedContact.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaClock className="text-slate-500 w-4" />
                                        <span className="text-slate-400">{formatDate(selectedContact.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-700">
                                    <h3 className="font-semibold text-white mb-2">{selectedContact.subject}</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-700 flex gap-3">
                                    {!selectedContact.resolved && (
                                        <button onClick={() => handleResolve(selectedContact.id)}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition text-sm flex items-center justify-center gap-2">
                                            <FaCheck /> Mark Resolved
                                        </button>
                                    )}
                                    <button onClick={() => setDeleteModal({ show: true, contact: selectedContact })}
                                        className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm flex items-center justify-center gap-2">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500">
                                <FaEye className="text-5xl mx-auto mb-3 opacity-30 text-slate-600" />
                                <p>Select a message to view details</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile: show detail when selected */}
                    {selectedContact && (
                        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900 overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Message Details</h2>
                                <button onClick={() => setSelectedContact(null)} className="text-slate-400 hover:text-white text-2xl transition">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <FaUser className="text-slate-500 w-4" />
                                    <span className="font-medium text-gray-200">{selectedContact.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FaEnvelope className="text-slate-500 w-4" />
                                    <a href={`mailto:${selectedContact.email}`} className="text-blue-400 hover:underline">{selectedContact.email}</a>
                                </div>
                                {selectedContact.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaPhone className="text-slate-500 w-4" />
                                        <span className="text-slate-300">{selectedContact.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <FaClock className="text-slate-500 w-4" />
                                    <span className="text-slate-400">{formatDate(selectedContact.createdAt)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-700">
                                <h3 className="font-semibold text-white mb-2">{selectedContact.subject}</h3>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-700 flex gap-3">
                                {!selectedContact.resolved && (
                                    <button onClick={() => handleResolve(selectedContact.id)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition text-sm flex items-center justify-center gap-2">
                                        <FaCheck /> Resolve
                                    </button>
                                )}
                                <button onClick={() => setDeleteModal({ show: true, contact: selectedContact })}
                                    className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, contact: null })}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Message?</h3>
                            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
                            {deleteModal.contact && (
                                <div className="bg-slate-700/50 rounded-lg px-4 py-3 w-full mb-6">
                                    <p className="font-semibold text-white">{deleteModal.contact.subject}</p>
                                    <p className="text-sm text-slate-400">{deleteModal.contact.name}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ show: false, contact: null })} disabled={deleting}
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

export default AdminContacts;
