import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getJobs, deleteJob } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const RecruiterJobs = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [jobs, setJobs] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await getJobs();
      console.log("Fetched jobs:", response);
      setJobs(response); // Assuming the response is an array of jobs
    } catch (error) {
      console.error("Error fetching jobs:", error);
      addToast("Failed to load jobs.", "error");
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchMatch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());

      const statusMatch =
        status === "ALL" || job.status === status;

      return searchMatch && statusMatch;
    });
  }, [jobs, search, status]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";

      case "CLOSED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleDeleteClick = (job) => {
    setDeleteModal({ show: true, job });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.job) return;
    setDeleting(true);
    try {
      await deleteJob(deleteModal.job.id);
      setDeleteModal({ show: false, job: null });
      fetchJobs();
      addToast("Job deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting job:", error);
      addToast("Failed to delete job. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, job: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}

        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5 mb-8">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Jobs
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage all your job postings from one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/post-job")}
            className="
            bg-[#2557A7]
            hover:bg-blue-800
            text-white
            px-5
            py-3
            rounded-lg
            flex
            items-center
            gap-2
            font-medium
            transition
            cursor-pointer
            "
          >
            <FaPlus />
            Create Job
          </button>

        </div>

        {/* Search */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">

          <div className="grid lg:grid-cols-2 gap-4">

            <div className="flex items-center border rounded-lg px-4">

              <FaSearch className="text-gray-400 mr-3" />

              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 outline-none"
              />

            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-4 py-3 outline-none"
            >
              <option value="ALL">All Jobs</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>

          </div>

        </div>

        {/* Count */}

        <div className="mb-5">
          <p className="text-gray-600 text-sm">
            Showing
            <span className="font-semibold text-gray-900">
              {" "}
              {filteredJobs.length}{" "}
            </span>
            jobs
          </p>
        </div>

        {/* Job Cards */}

        <div className="space-y-4">

          {filteredJobs.map((job) => (

            <div
              key={job.id}
              className="
              bg-white
              rounded-xl
              border
              border-gray-200
              shadow-sm
              hover:shadow-md
              transition
              p-5
              "
            >

              {/* Top */}

              <div className="flex flex-col lg:flex-row justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3 flex-wrap">

                    <h2 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h2>

                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>

                  </div>

                  <p className="text-gray-700 text-sm mt-1">
                    {job.companyName}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">

                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt />
                      {job.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <FaBriefcase />
                      {job.jobType.replace("_", " ")}
                    </div>

                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {job.workLocation}
                    </span>

                  </div>

                </div>

                {/* Salary */}

                <div className="text-left lg:text-right">

                  <p className="font-semibold text-[#2557A7]">
                    {formatSalaryRange(job.salaryMin, job.salaryMax)}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Vacancies : {job.vacancy}
                  </p>

                </div>

              </div>

              {/* Skills */}

              <div className="flex flex-wrap gap-2 mt-5">

                {job.skills.map((skill, index) => (

                  <span
                    key={index}
                    className="
                    bg-blue-100
                    text-blue-700
                    text-xs
                    px-3
                    py-1
                    rounded-full
                    "
                  >
                    {skill}
                  </span>

                ))}

              </div>

              {/* Bottom */}

              <div className="mt-6 pt-4 border-t flex flex-col lg:flex-row justify-between lg:items-center gap-4">

                <button
                  onClick={() => navigate(`/hire/jobs/${job.id}/applicants`)}
                  className="
                  flex
                  items-center
                  gap-2
                  bg-green-100
                  text-green-700
                  px-3
                  py-2
                  rounded-lg
                  w-fit
                  text-sm
                  hover:bg-green-200
                  transition
                  cursor-pointer
                  "
                >
                  <FaUsers />
                  {job.totalApplications} Applications
                </button>

                <div className="flex gap-3">

                  <button
                    onClick={() => navigate(`/hire/jobs/${job.id}`)}
                    className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-lg
                    border
                    border-gray-300
                    hover:bg-gray-100
                    transition
                    text-sm
                    "
                  >
                    <FaEye />
                    View
                  </button>

                  <button
                    onClick={() => navigate(`/hire/edit-job/${job.id}`)}
                    className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-lg
                    bg-blue-50
                    text-[#2557A7]
                    hover:bg-blue-100
                    transition
                    text-sm
                    "
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClick(job)}
                    className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-lg
                    bg-red-50
                    text-red-600
                    hover:bg-red-100
                    transition
                    text-sm
                    "
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-700">
                No Jobs Found
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Try changing the search keyword or status filter.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Delete Confirmation Modal */}

      {deleteModal.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FaExclamationTriangle className="text-red-600 text-3xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Job?
              </h3>

              <p className="text-gray-500 text-sm mb-1">
                Are you sure you want to delete this job posting?
              </p>

              <p className="text-gray-500 text-sm mb-6">
                This action cannot be undone.
              </p>

              {deleteModal.job && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 w-full mb-6">
                  <p className="font-semibold text-gray-800">
                    {deleteModal.job.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {deleteModal.job.companyName}
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="
                    flex-1 px-4 py-3 rounded-xl border border-gray-300
                    text-gray-700 font-medium hover:bg-gray-100
                    transition disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="
                    flex-1 px-4 py-3 rounded-xl bg-red-600 text-white
                    font-medium hover:bg-red-700 transition
                    disabled:opacity-50 flex items-center justify-center gap-2
                  "
                >
                  {deleting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterJobs;