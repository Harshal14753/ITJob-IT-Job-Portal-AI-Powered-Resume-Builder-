import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUsers,
  FaMapMarkerAlt,
  FaStar,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaDownload,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaUserCheck,
  FaCalendarCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  getApplicantsForJob,
  updateApplicationStatus,
  getJobById,
} from "../../services/JobService";
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
    progress: 10,
  },
  REVIEWING: {
    label: "Reviewing",
    icon: FaEye,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    progress: 30,
  },
  INTERVIEWING: {
    label: "Interviewing",
    icon: FaCalendarCheck,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    progress: 50,
  },
  ACCEPTED: {
    label: "Accepted",
    icon: FaCheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    progress: 100,
  },
  REJECTED: {
    label: "Rejected",
    icon: FaTimesCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    progress: 0,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: FaTimesCircle,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    progress: 0,
  },
};

const availableTransitions = {
  PENDING: ["REVIEWING", "REJECTED"],
  REVIEWING: ["INTERVIEWING", "REJECTED", "PENDING"],
  INTERVIEWING: ["ACCEPTED", "REJECTED", "REVIEWING"],
  ACCEPTED: ["REJECTED"],
  REJECTED: ["PENDING"],
  WITHDRAWN: [],
};

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchJob();
    fetchApplicants();
  }, [jobId, page]);

  const fetchJob = async () => {
    try {
      const data = await getJobById(jobId);
      setJob(data);
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details.");
    } finally {
      setJobLoading(false);
    }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const data = await getApplicantsForJob(jobId, page, pageSize);
      setApplicants(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Failed to load applicants.");
      addToast("Failed to load applicants.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setShowStatusDropdown(null);
    try {
      await updateApplicationStatus(jobId, applicationId, newStatus);
      // Update the local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      addToast("Failed to update application status. Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const statusMatch =
        statusFilter === "ALL" || app.status === statusFilter;

      const searchTerm = search.toLowerCase();
      const searchMatch =
        !searchTerm ||
        (app.fullName && app.fullName.toLowerCase().includes(searchTerm)) ||
        (app.email && app.email.toLowerCase().includes(searchTerm)) ||
        (app.skills &&
          app.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm)
          ));

      return statusMatch && searchMatch;
    });
  }, [applicants, statusFilter, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "—";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJobType = (type) =>
    type ? type.replace(/_/g, " ") : "—";

  const extractFileName = (publicId) => {
    if (!publicId) return null;
    const idPart = publicId.substring(publicId.lastIndexOf("/") + 1);
    const idx = idPart.indexOf("_");
    return idx >= 0 ? idPart.substring(idx + 1) : idPart;
  };

  const getStatusCounts = () => {
    const counts = {};
    applicants.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalApplicants = applicants.length;

  if (error && !jobLoading && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-sm">
          <FaUsers className="text-gray-300 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(`/hire/jobs/${jobId}`)}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
          >
            <FaArrowLeft /> Back to Job Details
          </button>

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Applicants
              </h1>
              {job && (
                <p className="text-blue-100 mt-2 text-lg">
                  {job.title} — {job.companyName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {totalApplicants}
                </p>
                <p className="text-blue-100 text-xs mt-1">Total</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {statusCounts["PENDING"] || 0}
                </p>
                <p className="text-blue-100 text-xs mt-1">Pending</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {statusCounts["ACCEPTED"] || 0}
                </p>
                <p className="text-blue-100 text-xs mt-1">Accepted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
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
                <option value="ALL">All Statuses</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({statusCounts[key] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Loading applicants...</p>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && totalElements > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">{totalElements}</span>{" "}
            applicants
          </p>
        )}

        {/* Applicant Cards */}
        {!loading && (
          <div className="space-y-4">
            {filteredApplicants.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FaUsers className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Applicants Found
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or filter."
                    : "No one has applied to this job yet."}
                </p>
              </div>
            ) : (
              filteredApplicants.map((applicant) => {
                const config =
                  statusConfig[applicant.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                const transitions =
                  availableTransitions[applicant.status] || [];
                const isUpdating = updatingId === applicant.applicationId;

                return (
                  <div
                    key={applicant.applicationId}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Top Row */}
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        {/* Left - Candidate Info */}
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                            {applicant.fullName
                              ? applicant.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "?"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {applicant.fullName || "Unknown Candidate"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {applicant.email}
                            </p>

                            {/* Skills */}
                            {applicant.skills &&
                              applicant.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {applicant.skills
                                    .slice(0, 6)
                                    .map((skill, i) => (
                                      <span
                                        key={i}
                                        className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  {applicant.skills.length > 6 && (
                                    <span className="text-xs text-gray-400 flex items-center">
                                      +{applicant.skills.length - 6} more
                                    </span>
                                  )}
                                </div>
                              )}

                            {/* Latest Experience */}
                            {(applicant.latestExperienceTitle ||
                              applicant.latestExperienceCompany) && (
                              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                <FaStar className="text-yellow-500 text-xs" />
                                <span>
                                  {applicant.latestExperienceTitle}
                                  {applicant.latestExperienceCompany &&
                                    ` at ${applicant.latestExperienceCompany}`}
                                </span>
                              </div>
                            )}

                            {/* Links */}
                            <div className="flex items-center gap-3 mt-3">
                              {applicant.phoneNo && (
                                <span className="text-xs text-gray-500">
                                  📞 {applicant.phoneNo}
                                </span>
                              )}
                              {applicant.linkedInLink && (
                                <a
                                  href={applicant.linkedInLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="LinkedIn"
                                >
                                  <FaLinkedin />
                                </a>
                              )}
                              {applicant.githubLink && (
                                <a
                                  href={applicant.githubLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-700 hover:text-gray-900"
                                  title="GitHub"
                                >
                                  <FaGithub />
                                </a>
                              )}
                              {applicant.portfolioLink && (
                                <a
                                  href={applicant.portfolioLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-green-600 hover:text-green-800"
                                  title="Portfolio"
                                >
                                  <FaGlobe />
                                </a>
                              )}
                              {applicant.resumeUrl && (
                                <a
                                  href={applicant.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs"
                                  title="Download Resume"
                                >
                                  <FaDownload />
                                  {extractFileName(
                                    applicant.resumePublicId
                                  ) || "Resume"}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right - Status & Date */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2 shrink-0">
                          {/* Status Badge with Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowStatusDropdown(
                                  showStatusDropdown ===
                                    applicant.applicationId
                                    ? null
                                    : applicant.applicationId
                                )
                              }
                              disabled={isUpdating}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer hover:shadow-md transition ${config.bg} ${config.border}`}
                            >
                              {isUpdating ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <div
                                  className={`w-7 h-7 rounded-full ${config.iconBg} flex items-center justify-center`}
                                >
                                  <StatusIcon
                                    className={`${config.iconColor} text-sm`}
                                  />
                                </div>
                              )}
                              <span
                                className={`text-sm font-semibold ${config.text}`}
                              >
                                {config.label}
                              </span>
                            </button>

                            {/* Dropdown */}
                            {showStatusDropdown ===
                              applicant.applicationId && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-2">
                                <p className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                  Change Status
                                </p>
                                {transitions.length > 0 ? (
                                  transitions.map((statusKey) => {
                                    const transitionConfig =
                                      statusConfig[statusKey];
                                    const TransitionIcon =
                                      transitionConfig.icon;
                                    return (
                                      <button
                                        key={statusKey}
                                        onClick={() =>
                                          handleStatusUpdate(
                                            applicant.applicationId,
                                            statusKey
                                          )
                                        }
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${transitionConfig.text}`}
                                      >
                                        <div
                                          className={`w-6 h-6 rounded-full ${transitionConfig.iconBg} flex items-center justify-center`}
                                        >
                                          <TransitionIcon className="text-xs" />
                                        </div>
                                        {transitionConfig.label}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <p className="px-4 py-2 text-xs text-gray-400 italic">
                                    No transitions available
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="w-full lg:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                applicant.status === "ACCEPTED"
                                  ? "bg-green-500"
                                  : applicant.status === "REJECTED"
                                  ? "bg-red-400"
                                  : applicant.status === "INTERVIEWING"
                                  ? "bg-purple-500"
                                  : applicant.status === "REVIEWING"
                                  ? "bg-blue-500"
                                  : "bg-yellow-400"
                              }`}
                              style={{
                                width: `${config.progress}%`,
                              }}
                            />
                          </div>

                          {/* Date */}
                          <div className="text-xs text-gray-400">
                            Applied {formatDate(applicant.applicationDate)}
                          </div>
                          {applicant.statusUpdatedAt && applicant.status !== "PENDING" && (
                            <div className="text-xs text-gray-400 mt-1">
                              Updated {formatDateTime(applicant.statusUpdatedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* About section */}
                      {applicant.about && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {applicant.about}
                          </p>
                        </div>
                      )}

                      {/* View Full Profile */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() =>
                            navigate(
                              `/hire/jobs/${jobId}/applicants/${applicant.applicationId}`
                            )
                          }
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          View Full Profile
                        </button>
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
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showStatusDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowStatusDropdown(null)}
        />
      )}
    </div>
  );
};

export default JobApplicants;
