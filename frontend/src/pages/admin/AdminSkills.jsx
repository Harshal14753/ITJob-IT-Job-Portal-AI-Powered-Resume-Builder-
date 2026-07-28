import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaCogs,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSpinner,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import {
    getAdminSkills,
    createAdminSkill,
    updateAdminSkill,
    deleteAdminSkill,
} from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const AdminSkills = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [skills, setSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [formData, setFormData] = useState({ skill: "" });
    const [saving, setSaving] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, skill: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredSkills(skills);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredSkills(
                skills.filter((s) => s.skill.toLowerCase().includes(q))
            );
        }
    }, [searchQuery, skills]);

    const fetchSkills = async (search) => {
        setLoading(true);
        try {
            const data = await getAdminSkills(search || "");
            setSkills(data);
            setFilteredSkills(data);
        } catch (error) {
            console.error("Error fetching skills:", error);
            addToast("Failed to load skills.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = useCallback(
        debounce((value) => {
            setSearchQuery(value);
        }, 300),
        []
    );

    const openCreateModal = () => {
        setEditingSkill(null);
        setFormData({ skill: "" });
        setShowModal(true);
    };

    const openEditModal = (skill) => {
        setEditingSkill(skill);
        setFormData({ skill: skill.skill || "" });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.skill.trim()) {
            addToast("Skill name is required.", "error");
            return;
        }
        setSaving(true);
        try {
            if (editingSkill) {
                await updateAdminSkill(editingSkill.id, formData);
                addToast("Skill updated successfully.", "success");
            } else {
                await createAdminSkill(formData);
                addToast("Skill created successfully.", "success");
            }
            setShowModal(false);
            fetchSkills(searchQuery);
        } catch (error) {
            console.error("Error saving skill:", error);
            addToast(error.response?.data?.message || "Failed to save skill.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.skill) return;
        setDeleting(true);
        try {
            await deleteAdminSkill(deleteModal.skill.id);
            setSkills((prev) => prev.filter((s) => s.id !== deleteModal.skill.id));
            setFilteredSkills((prev) => prev.filter((s) => s.id !== deleteModal.skill.id));
            setDeleteModal({ show: false, skill: null });
            addToast("Skill deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting skill:", error);
            addToast("Failed to delete skill.", "error");
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                <FaCogs className="text-2xl text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Skills</h1>
                                <p className="text-blue-300 mt-1">
                                    {skills.length} skill{skills.length !== 1 ? "s" : ""} &middot; Sorted A&ndash;Z
                                </p>
                            </div>
                        </div>
                        <button onClick={openCreateModal}
                            className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-600/25">
                            <FaPlus /> Add Skill
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            defaultValue={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); document.querySelector('input[placeholder="Search skills..."]').value = ""; }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-emerald-400 text-4xl" />
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                        <FaCogs className="text-slate-600 text-5xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">
                            {searchQuery ? "No matching skills" : "No Skills"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">
                            {searchQuery
                                ? "Try a different search term."
                                : "Add your first skill to the database. Skills help candidates and recruiters find each other."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary bar */}
                        <div className="bg-slate-800/50 border border-slate-600 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
                            <span className="text-slate-300 text-sm">
                                Showing <strong className="text-white">{filteredSkills.length}</strong>{" "}
                                {filteredSkills.length === 1 ? "skill" : "skills"}
                                {searchQuery && (
                                    <span className="text-slate-400">
                                        {" "}(filtered from {skills.length})
                                    </span>
                                )}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                                A&ndash;Z
                            </span>
                        </div>

                        {/* Skills Grid */}
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredSkills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="group bg-slate-800 rounded-xl border border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-600/50 transition-all p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 min-w-0">                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <FaCogs className="text-emerald-400 text-sm" />
                                        </div>
                                        <span className="font-medium text-gray-100 truncate">
                                            {skill.skill}
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            onClick={() => openEditModal(skill)}
                                            className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center"
                                            title="Edit"
                                        >
                                            <FaEdit className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, skill })}
                                            className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex items-center justify-center"
                                            title="Delete"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {editingSkill ? "Edit Skill" : "Add Skill"}
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {editingSkill
                                ? "Update the skill name."
                                : "Add a new skill to the database. Skills appear in alphabetical order."}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Skill Name *</label>
                                <input
                                    type="text"
                                    value={formData.skill}
                                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                                    placeholder="e.g. Java, Python, React.js"
                                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 p-3 border border-slate-600 rounded-xl text-slate-300 font-medium hover:bg-slate-700 transition">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving || !formData.skill.trim()}
                                className="flex-1 p-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingSkill ? "Update" : "Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, skill: null })}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Skill?</h3>
                            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
                            {deleteModal.skill && (
                                <div className="bg-slate-700/50 rounded-lg px-4 py-3 w-full mb-6">
                                    <p className="font-semibold text-white">{deleteModal.skill.skill}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ show: false, skill: null })} disabled={deleting}
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

// Debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export default AdminSkills;
