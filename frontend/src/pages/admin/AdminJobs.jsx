import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaBriefcase,
    FaTrash,
    FaBuilding,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaSpinner,
    FaSearch,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaStar,
    FaRegStar,
    FaHourglassHalf,
    FaFilter,
} from "react-icons/fa";
import {
    getAdminJobs,
    deleteAdminJob,
    approveAdminJob,
    rejectAdminJob,
    toggleAdminJobFeatured,
} from "../../services/AdminService";
import { useToast } from "../../components/Toast";
import Pagination from "../../components/Pagination";

const STATUS_CONFIG = {
    "Active": { color: "bg-green-100 text-green-800" },
    "Featured": { color: "bg-yellow-100 text-yellow-800" },
    "Pending Approval": { color: "bg-orange-100 text-orange-800" },
    "Expired": { color: "bg-red-100 text-red-800" },
    "Closed": { color: "bg-gray-100 text-gray-500" },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { color: "bg-gray-100 text-gray-700" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            {status === "Featured" && <FaStar className="text-yellow-600" />}
            {status === "Pending Approval" && <FaHourglassHalf className="text-orange-600" />}
            {status === "Active" && <FaCheckCircle className="text-green-600" />}
            {status === "Expired" && <FaTimesCircle className="text-red-600" />}
            {status === "Closed" && <FaTimesCircle className="text-gray-400" />}
            {status}
        </span>
    );
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const AdminJobs = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
    const [deleting, setDeleting] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    // Pagination state
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Refresh counter to re-fetch after mutations
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchJobs();
    }, [page, pageSize, refreshKey]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await getAdminJobs(page, pageSize, "createdAt", "desc");
            setJobs(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            addToast("Failed to load jobs.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(0);
    };

    // Client-side search/status filter on already loaded page
    const filteredJobs = jobs.filter((job) => {
        if (search) {
            const term = search.toLowerCase();
            const matchesSearch =
                job.title?.toLowerCase().includes(term) ||
                job.companyName?.toLowerCase().includes(term) ||
                job.recruiterEmail?.toLowerCase().includes(term);
            if (!matchesSearch) return false;
        }

        if (statusFilter !== "all") {
            if (statusFilter === "pending" && job.status !== "Pending Approval") return false;
            if (statusFilter === "active" && job.status !== "Active") return false;
            if (statusFilter === "featured" && job.status !== "Featured") return false;
            if (statusFilter === "expired" && job.status !== "Expired") return false;
            if (statusFilter === "closed" && job.status !== "Closed") return false;
        }

        return true;
    });

    const handleApprove = async (jobId) => {
        setActionLoading((prev) => ({ ...prev, [`approve-${jobId}`]: true }));
        try {
            await approveAdminJob(jobId);
            addToast("Job approved successfully.", "success");
            setRefreshKey((k) => k + 1);
        } catch (error) {
            addToast("Failed to approve job.", "error");
        } finally {
            setActionLoading((prev) => ({ ...prev, [`approve-${jobId}`]: false }));
        }
    };

    const handleReject = async (jobId) => {
        setActionLoading((prev) => ({ ...prev, [`reject-${jobId}`]: true }));
        try {
            await rejectAdminJob(jobId);
            addToast("Job rejected and closed.", "success");
            setRefreshKey((k) => k + 1);
        } catch (error) {
            addToast("Failed to reject job.", "error");
        } finally {
            setActionLoading((prev) => ({ ...prev, [`reject-${jobId}`]: false }));
        }
    };

    const handleToggleFeatured = async (jobId) => {
        setActionLoading((prev) => ({ ...prev, [`feature-${jobId}`]: true }));
        try {
            await toggleAdminJobFeatured(jobId);
            addToast("Featured status toggled.", "success");
            setRefreshKey((k) => k + 1);
        } catch (error) {
            addToast("Failed to toggle featured status.", "error");
        } finally {
            setActionLoading((prev) => ({ ...prev, [`feature-${jobId}`]: false }));
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.job) return;
        setDeleting(true);
        try {
            await deleteAdminJob(deleteModal.job.id);
            setDeleteModal({ show: false, job: null });
            addToast("Job deleted successfully.", "success");
            setRefreshKey((k) => k + 1);
        } catch (error) {
            addToast("Failed to delete job.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const formatSalary = (salary) => salary ? `₹${(salary / 100000).toFixed(1)} LPA` : null;
    const formatSalaryRange = (min, max) => {
        const minStr = formatSalary(min);
        const maxStr = formatSalary(max);
        if (minStr && maxStr) return `${minStr} — ${maxStr}`;
        if (minStr) return minStr;
        if (maxStr) return maxStr;
        return "—";
    };
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const pendingCount = jobs.filter((j) => j.status === "Pending Approval").length;
    const featuredCount = jobs.filter((j) => j.featured).length;

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 border-b border-slate-600">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 text-blue-300 hover:text-white transition mb-4"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                            <FaBriefcase className="text-2xl text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Job Moderation</h1>
                            <p className="text-blue-300 mt-1">
                                {totalElements} job{totalElements !== 1 ? "s" : ""} on the platform
                                {pendingCount > 0 && (
                                    <span className="ml-2 text-orange-400 font-medium">
                                        · {pendingCount} on this page
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, company, or recruiter... (client-side)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <FaFilter className="text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending Approval</option>
                                <option value="active">Active</option>
                                <option value="featured">Featured</option>
                                <option value="expired">Expired</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-400 text-4xl" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                        <FaBriefcase className="text-slate-600 text-5xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">No Jobs Found</h3>
                        <p className="text-sm text-slate-400 mt-2">
                            {search || statusFilter !== "all"
                                ? "No jobs match your filters on this page."
                                : "No jobs have been posted yet."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-600 transition p-6"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                                                <FaBuilding className="text-orange-400 text-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                                    <StatusBadge status={job.status} />
                                                    {job.featured && <FaStar className="text-yellow-400" />}
                                                </div>
                                                <p className="text-orange-400 font-medium text-sm mt-0.5">{job.companyName}</p>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <FaMapMarkerAlt className="text-slate-500" />{job.location || "—"}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <FaMoneyBillWave className="text-slate-500" />
                                                        {formatSalaryRange(job.salaryMin, job.salaryMax)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <FaUsers className="text-slate-500" />{job.totalApplicants} Applicant{job.totalApplicants !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {job.skills?.slice(0, 4).map((skill, i) => (
                                                        <span key={i} className="bg-blue-500/10 text-blue-300 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                                                    ))}
                                                    {job.skills?.length > 4 && (
                                                        <span className="text-xs text-slate-500">+{job.skills.length - 4} more</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                                                    <span>Posted by {job.recruiterEmail} on {formatDate(job.createdAt)}</span>
                                                    {job.expiresAt && <span>Expires: {formatDate(job.expiresAt)}</span>}
                                                    {job.featuredUntil && <span className="text-yellow-400">Featured until: {formatDate(job.featuredUntil)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 flex-wrap">
                                            {job.status === "Pending Approval" && (
                                                <>
                                                    <button onClick={() => handleApprove(job.id)} disabled={actionLoading[`approve-${job.id}`]}
                                                        className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                                        {actionLoading[`approve-${job.id}`] ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve
                                                    </button>
                                                    <button onClick={() => handleReject(job.id)} disabled={actionLoading[`reject-${job.id}`]}
                                                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                                        {actionLoading[`reject-${job.id}`] ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Reject
                                                    </button>
                                                </>
                                            )}
                                            {(job.status === "Active" || job.status === "Featured") && (
                                                <button onClick={() => handleToggleFeatured(job.id)} disabled={actionLoading[`feature-${job.id}`]}
                                                    className={`px-4 py-2 rounded-xl transition text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${
                                                        job.featured ? "bg-yellow-600 text-white hover:bg-yellow-700" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                                    }`}>
                                                    {actionLoading[`feature-${job.id}`] ? <FaSpinner className="animate-spin" /> : job.featured ? <FaStar /> : <FaRegStar />}
                                                    {job.featured ? "Featured" : "Feature"}
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteModal({ show: true, job })}
                                                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm font-medium flex items-center gap-2">
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                        />
                    </>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setDeleteModal({ show: false, job: null })}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-700"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Job?</h3>
                            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
                            {deleteModal.job && (
                                <div className="bg-slate-700/50 rounded-lg px-4 py-3 w-full mb-6">
                                    <p className="font-semibold text-white">{deleteModal.job.title}</p>
                                    <p className="text-sm text-slate-400">{deleteModal.job.companyName}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ show: false, job: null })} disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition disabled:opacity-50">Cancel</button>
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

export default AdminJobs;
