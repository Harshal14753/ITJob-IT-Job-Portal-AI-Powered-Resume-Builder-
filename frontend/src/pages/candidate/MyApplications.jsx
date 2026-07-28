import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCalendarAlt,
  FaEye,
  FaCalendarCheck,
  FaUserCheck,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { getMyApplications } from "../../services/JobService";
import { useToast } from "../../components/Toast";
import Pagination from "../../components/Pagination";

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: FaClock,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  REVIEWING: {
    label: "Reviewing",
    icon: FaEye,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  INTERVIEWING: {
    label: "Interviewing",
    icon: FaCalendarCheck,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: FaCheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  REJECTED: {
    label: "Rejected",
    icon: FaTimesCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: FaUserCheck,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

const MyApplications = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchApplications();
  }, [page]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getMyApplications(page, PAGE_SIZE);
      setApplications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching applications:", error);
      addToast("Failed to load applications. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const statusMatch = statusFilter === "ALL" || app.status === statusFilter;

      const searchTerm = search.toLowerCase();
      const searchMatch =
        !searchTerm ||
        (app.jobTitle && app.jobTitle.toLowerCase().includes(searchTerm)) ||
        (app.companyName && app.companyName.toLowerCase().includes(searchTerm)) ||
        (app.jobLocation && app.jobLocation.toLowerCase().includes(searchTerm));

      return statusMatch && searchMatch;
    });
  }, [applications, statusFilter, search]);

  const formatSalary = (salary) =>
    salary ? `₹${(salary / 100000).toFixed(1)} LPA` : null;

  const formatSalaryRange = (min, max) => {
    const minStr = formatSalary(min);
    const maxStr = formatSalary(max);
    if (minStr && maxStr) return `${minStr} — ${maxStr}`;
    if (minStr) return minStr;
    if (maxStr) return maxStr;
    return "—";
  };

  const formatJobType = (type) =>
    type ? type.replace(/_/g, " ") : "—";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusCounts = () => {
    const counts = { PENDING: 0, REVIEWING: 0, INTERVIEWING: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 };
    applications.forEach((app) => {
      if (counts[app.status] !== undefined) counts[app.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalApplications = applications.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">My Applications</h1>
          <p className="text-blue-100 mt-2">
            Track the status of all your job applications.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div
            onClick={() => setStatusFilter("ALL")}
            className={`bg-white border rounded-2xl p-4 text-center cursor-pointer transition hover:shadow-md ${
              statusFilter === "ALL" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
            }`}
          >
            <p className="text-xl font-bold text-gray-800">{totalApplications}</p>
            <p className="text-xs text-gray-500 mt-1">All</p>
          </div>
          {Object.entries(statusConfig).map(([key, config]) => {
            const StatusIcon = config.icon;
            return (
              <div
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`border rounded-2xl p-4 text-center cursor-pointer transition hover:shadow-md ${config.bg} ${
                  statusFilter === key ? `${config.border} ring-2 ring-opacity-50` : "border-gray-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-2`}>
                  <StatusIcon className={`${config.iconColor} text-sm`} />
                </div>
                <p className={`text-xl font-bold ${config.text}`}>{statusCounts[key]}</p>
                <p className={`text-xs ${config.text} mt-1`}>{config.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        {!loading && totalApplications > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl px-4">
                <FaSearch className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-3 outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4">
                <FaFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-3 outline-none text-sm bg-transparent"
                >
                  <option value="ALL">All Statuses ({totalApplications})</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} ({statusCounts[key] || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-[#2557A7] text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Loading applications...</p>
            </div>
          </div>
        )}

        {!loading && totalElements > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredApplications.length}
            </span>{" "}
            of {totalElements} applications on this page
          </p>
        )}

        {/* Application Cards */}
        {!loading && (
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FaBriefcase className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">
                  {search || statusFilter !== "ALL" ? "No Matching Applications" : "No Applications Yet"}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or filter."
                    : "Start applying to jobs to see them here."}
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="mt-6 px-6 py-3 rounded-xl bg-[#2557A7] text-white font-medium hover:bg-blue-800 transition"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const config = statusConfig[app.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* Left - Job Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <FaBuilding className="text-blue-700 text-lg" />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.jobTitle}
                          </h3>
                          <p className="text-blue-600 font-medium text-sm">
                            {app.companyName}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {app.jobLocation || "—"}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <FaBriefcase className="text-gray-400" />
                              {formatJobType(app.jobType)}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <FaMoneyBillWave className="text-gray-400" />
                              {formatSalaryRange(app.salaryMin, app.salaryMax)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right - Status & Date */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2 shrink-0">
                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.bg} ${config.border}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full ${config.iconBg} flex items-center justify-center`}
                          >
                            <StatusIcon
                              className={`${config.iconColor} text-sm`}
                            />
                          </div>
                          <span
                            className={`text-sm font-semibold ${config.text}`}
                          >
                            {config.label}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FaCalendarAlt />
                          Applied {formatDate(app.applicationDate)}
                        </div>
                        {app.statusUpdatedAt && app.status !== "PENDING" && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FaClock />
                            Updated {formatDate(app.statusUpdatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <Pagination
            variant="light"
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
};

export default MyApplications;
