import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaUsers,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getJobById, deleteJob } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const ViewJob = () => {

  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await getJobById(jobId);
      setJob(response);
    } catch (error) {
      console.log(error);
      addToast("Failed to load job details.", "error");
    }
  };

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

  if (!job) {
    return (
      <div className="text-center py-20 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">

      <div className="max-w-5xl mx-auto">

        {/* Back */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 text-blue-700"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Card */}

        <div className="bg-white rounded-xl shadow p-8">

          {/* Title */}

          <div className="flex justify-between items-start">

            <div>

              <h1 className="text-3xl font-bold">
                {job.title}
              </h1>

              <p className="text-gray-500 mt-2">
                {job.companyName}
              </p>

            </div>

            <span
              className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm"
            >
              {job.status}
            </span>

          </div>

          {/* Details */}

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-600"/>
              <span>{job.location}</span>
            </div>

            <div className="flex items-center gap-3">
              <FaBriefcase className="text-blue-600"/>
              <span>{job.jobType}</span>
            </div>

            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="text-blue-600"/>
              <span>
                {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaUsers className="text-blue-600"/>
              <span>{job.vacancy} Vacancies</span>
            </div>

            <div>
              <strong>Work Mode :</strong>
              <p>{job.workLocation}</p>
            </div>

            <div>
              <strong>Website :</strong>
              <a
                href={job.websiteLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700"
              >
                Visit Website
              </a>
            </div>

          </div>

          {/* Description */}

          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-3">
              Job Description
            </h2>

            <p className="text-gray-700 leading-7">
              {job.description}
            </p>

          </div>

          {/* Skills */}

          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-3">
              Required Skills
            </h2>

            <div className="flex flex-wrap gap-2">

              {job.skills.map((skill, index) => (

                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>

          {/* Benefits */}

          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-3">
              Benefits
            </h2>

            <ul className="list-disc ml-6 space-y-2">

              {job.benefits.map((benefit, index) => (

                <li key={index}>
                  {benefit}
                </li>

              ))}

            </ul>

          </div>

          {/* Buttons */}

          <div className="flex gap-4 mt-10 flex-wrap">

            <button
              onClick={() => navigate(`/hire/jobs/${job.id}/applicants`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <FaUsers />
              View Applicants ({job.totalApplications || 0})
            </button>

            <button
              onClick={() => navigate(`/hire/edit-job/${job.id}`)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <FaEdit />
              Edit Job
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <FaTrash />
              Delete Job
            </button>

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
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

              <div className="bg-gray-50 rounded-lg px-4 py-3 w-full mb-6">
                <p className="font-semibold text-gray-800">
                  {job.title}
                </p>
                <p className="text-sm text-gray-500">
                  {job.companyName}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
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
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await deleteJob(job.id);
                      addToast("Job deleted successfully.", "success");
                      navigate("/hire/jobs");
                    } catch (error) {
                      console.error("Error deleting job:", error);
                      addToast("Failed to delete job. Please try again.", "error");
                    } finally {
                      setDeleting(false);
                    }
                  }}
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

export default ViewJob;