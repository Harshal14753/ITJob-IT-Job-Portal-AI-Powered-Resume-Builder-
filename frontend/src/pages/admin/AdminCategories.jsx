import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaTags,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSpinner,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import {
    getAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
} from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const AdminCategories = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "", active: true });
    const [saving, setSaving] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAdminCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            addToast("Failed to load categories.", "error");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "", active: true });
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || "",
            description: category.description || "",
            active: category.active !== false,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            addToast("Category name is required.", "error");
            return;
        }
        setSaving(true);
        try {
            if (editingCategory) {
                await updateAdminCategory(editingCategory.id, formData);
                addToast("Category updated successfully.", "success");
            } else {
                await createAdminCategory(formData);
                addToast("Category created successfully.", "success");
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            addToast(error.response?.data?.message || "Failed to save category.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;
        setDeleting(true);
        try {
            await deleteAdminCategory(deleteModal.category.id);
            setCategories((prev) => prev.filter((c) => c.id !== deleteModal.category.id));
            setDeleteModal({ show: false, category: null });
            addToast("Category deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting category:", error);
            addToast("Failed to delete category.", "error");
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
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <FaTags className="text-2xl text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Categories</h1>
                                <p className="text-blue-300 mt-1">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
                            </div>
                        </div>
                        <button onClick={openCreateModal}
                            className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2">
                            <FaPlus /> Add Category
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-400 text-4xl" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                        <FaTags className="text-slate-600 text-5xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">No Categories</h3>
                        <p className="text-sm text-slate-400 mt-2">Create your first category to organize skills and jobs.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-600 transition p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${category.active ? "bg-indigo-500/20" : "bg-slate-700"} flex items-center justify-center`}>
                                            <FaTags className={category.active ? "text-indigo-400" : "text-slate-500"} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{category.name}</h3>
                                            {category.active !== false ? (
                                                <span className="text-xs text-green-400 flex items-center gap-1"><FaCheck /> Active</span>
                                            ) : (
                                                <span className="text-xs text-slate-500 flex items-center gap-1"><FaTimes /> Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {category.description && (
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{category.description}</p>
                                )}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
                                    <button onClick={() => openEditModal(category)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition text-sm flex items-center justify-center gap-1.5">
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => setDeleteModal({ show: true, category })}
                                        className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm flex items-center justify-center gap-1.5">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {editingCategory ? "Edit Category" : "Create Category"}
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {editingCategory ? "Update the category details." : "Add a new category for skills and jobs."}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
                                <input type="text" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Programming Languages" maxLength={100}
                                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                <textarea rows={3} value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category" maxLength={500}
                                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.active ? "bg-green-500" : "bg-slate-600"}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.active ? "translate-x-6" : "translate-x-0.5"}`} />
                                </button>
                                <span className={`text-sm ${formData.active ? "text-green-400" : "text-slate-400"}`}>Active</span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 p-3 border border-slate-600 rounded-xl text-slate-300 font-medium hover:bg-slate-700 transition">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving || !formData.name.trim()}
                                className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingCategory ? "Update" : "Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, category: null })}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Category?</h3>
                            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
                            {deleteModal.category && (
                                <div className="bg-slate-700/50 rounded-lg px-4 py-3 w-full mb-6">
                                    <p className="font-semibold text-white">{deleteModal.category.name}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ show: false, category: null })} disabled={deleting}
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

export default AdminCategories;
