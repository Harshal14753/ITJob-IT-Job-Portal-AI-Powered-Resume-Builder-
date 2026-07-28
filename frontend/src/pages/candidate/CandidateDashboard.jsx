import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaUsers,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaGlobe,
  FaBuilding,
  FaFilter,
  FaStar,
} from "react-icons/fa";
import {
  searchJobs,
  getJobByIdForCandidate,
  applyForJob,
  getMyApplications,
} from "../../services/JobService";
import { useToast } from "../../components/Toast";
import Pagination from "../../components/Pagination";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12;
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Job Details Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Apply
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Fetch jobs when page changes
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    } else {
      fetchJobs();
    }
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Debounce search: re-fetch when filters change
  useEffect(() => {
    if (isInitialRender) return;
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchJobs();
      } else {
        setPage(0);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, locationFilter, experienceFilter, jobTypeFilter, workModeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Parse skills from search text
      const skillsArray = search
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Build API params from filters
      const params = {};
      if (skillsArray.length > 0) {
        params.skills = skillsArray;
      }
      if (locationFilter.trim()) {
        params.location = locationFilter.trim();
      }
      if (experienceFilter) {
        params.minExperience = Number(experienceFilter);
      }
      params.page = page;
      params.size = PAGE_SIZE;

      const data = await searchJobs(params);

      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);

      // Apply client-side job type and work mode filters (not available in backend filter)
      let filtered = data.content || [];
      if (jobTypeFilter !== "ALL") {
        filtered = filtered.filter((job) => job.jobType === jobTypeFilter);
      }
      if (workModeFilter !== "ALL") {
        filtered = filtered.filter((job) => job.workLocation === workModeFilter);
      }

      setJobs(filtered);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications(0, 100);
      const applications = data.content || [];
      const appliedJobIds = new Set(applications.map((app) => app.jobId));
      setAppliedJobs(appliedJobIds);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const openJobDetails = async (jobId) => {
    setDetailsLoading(true);
    setDetailsModal(true);
    try {
      const data = await getJobByIdForCandidate(jobId);
      setSelectedJob(data);
      // Update appliedJobs based on the response field
      if (data.hasApplied) {
        setAppliedJobs((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      setDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeJobDetails = () => {
    setDetailsModal(false);
    setSelectedJob(null);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    // Check if profile is completed
    const profileCompleted = localStorage.getItem("profileCompleted");
    if (profileCompleted !== "true") {
      addToast("Please complete your profile before applying.", "info");
      navigate("/profile-setup");
      closeJobDetails();
      return;
    }

    setApplying(true);
    try {
      await applyForJob(selectedJob.id);
      setAppliedJobs((prev) => new Set(prev).add(selectedJob.id));
      addToast("Applied successfully!", "success");
    } catch (error) {
      console.error("Error applying for job:", error);
      if (error.response?.status === 409) {
        setAppliedJobs((prev) => new Set(prev).add(selectedJob.id));
        addToast("You have already applied for this job.", "error");
      } else {
        addToast("Failed to apply. Please try again.", "error");
      }
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Additional client-side search by title/company for the search input
      const searchTerm = search.toLowerCase();
      const titleCompanyMatch =
        !searchTerm ||
        job.title?.toLowerCase().includes(searchTerm) ||
        job.companyName?.toLowerCase().includes(searchTerm);

      return titleCompanyMatch;
    });
  }, [jobs, search]);

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

  const formatWorkLocation = (loc) =>
    loc ? loc.replace(/_/g, " ") : "—";

  return (

    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Find Your Dream Job
          </h1>
          <p className="text-blue-100 mt-3 text-lg">
            Browse through thousands of IT opportunities tailored for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          {/* Search Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center border rounded-xl px-4 h-12 transition">
              <FaSearch className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by title, company, or comma-separated skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition font-medium ${
                showFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Location
                </label>
                <div className="flex items-center border rounded-xl px-4 h-11 transition">
                  <FaMapMarkerAlt className="text-gray-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full outline-none bg-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Your Experience (years)
                </label>
                <div className="flex items-center border rounded-xl px-4 h-11 transition">
                  <FaBriefcase className="text-gray-400 mr-3 shrink-0" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Your experience"
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full outline-none bg-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Job Type
                </label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full border rounded-xl px-4 h-11 outline-none transition text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Work Mode
                </label>
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="w-full border rounded-xl px-4 h-11 outline-none transition text-sm"
                >
                  <option value="ALL">All Modes</option>
                  <option value="ON_SITE">On Site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-gray-600 text-sm">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredJobs.length}
            </span>{" "}
            {filteredJobs.length === 1 ? "job" : "jobs"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-[#2557A7] text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          </div>
        )}

        {/* Job Cards */}
        {!loading && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobDetails(job.id)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer p-6 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FaBuilding className="text-blue-700 text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium truncate">
                      {job.companyName}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="shrink-0 text-gray-400" />
                    <span className="truncate">{job.location || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaBriefcase className="shrink-0 text-gray-400" />
                    <span>{formatJobType(job.jobType)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                      {formatWorkLocation(job.workLocation)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMoneyBillWave className="shrink-0 text-gray-400" />
                    <span>
                      {formatSalaryRange(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Match score removed — shown on AI Auto-Apply review page */}
                  </div>

                  {appliedJobs.has(job.id) ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                      <FaCheckCircle />
                      Applied
                    </span>
                  ) : (
                    <span className="text-sm text-blue-600 font-medium">
                      View Details →
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FaSearch className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Jobs Found
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search keywords or filters.
                </p>
              </div>
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

      {/* Job Details Modal */}
      {detailsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeJobDetails}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading */}
            {detailsLoading && (
              <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-[#2557A7] text-4xl" />
              </div>
            )}

            {/* Job Details */}
            {!detailsLoading && selectedJob && (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-8 py-8 rounded-t-3xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <FaBuilding className="text-3xl text-white" />
                      </div>
                      <div className="text-white">
                        <h2 className="text-2xl font-bold">
                          {selectedJob.title}
                        </h2>
                        <p className="text-blue-100 mt-1">
                          {selectedJob.companyName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeJobDetails}
                      className="text-white/80 hover:text-white transition"
                    >
                      <FaTimes size={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8">
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <FaMapMarkerAlt className="text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1">
                        {selectedJob.location || "—"}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <FaBriefcase className="text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Job Type</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1">
                        {formatJobType(selectedJob.jobType)}
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <FaMoneyBillWave className="text-purple-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1">
                        {formatSalaryRange(selectedJob.salaryMin, selectedJob.salaryMax)}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <FaUsers className="text-orange-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Vacancies</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1">
                        {selectedJob.vacancy || 0}
                      </p>
                    </div>
                  </div>

                  {/* Work Mode (Match score removed — shown on AI Auto-Apply review page) */}
                  <div className="mb-6 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                      <FaBriefcase />
                      {formatWorkLocation(selectedJob.workLocation)}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Job Description
                    </h3>
                    <p className="text-gray-600 leading-7 whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Skills */}
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits &&
                    selectedJob.benefits.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Benefits
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Website */}
                  {selectedJob.websiteLink && (
                    <div className="mb-8">
                      <a
                        href={selectedJob.websiteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FaGlobe />
                        Visit Company Website
                      </a>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="border-t border-gray-200 pt-6">
                    {appliedJobs.has(selectedJob.id) ? (
                      <div className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-50 text-green-700 font-semibold">
                        <FaCheckCircle className="text-xl" />
                        Successfully Applied
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full py-4 rounded-2xl bg-[#2557A7] text-white font-semibold text-lg hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {applying ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Applying...
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
