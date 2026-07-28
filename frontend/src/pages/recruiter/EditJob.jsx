import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById, updateJob } from "../../services/JobService";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useToast } from "../../components/Toast";
import SkillPicker from "../../components/SkillPicker";

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    websiteLink: "",
    vacancy: "",
    jobType: "",
    workLocation: "",
    minExperience: "",
    benefits: "",
  });
  const [skillIds, setSkillIds] = useState([]);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getJobById(jobId);

      setJobData({
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        salaryMin: data.salaryMin ?? "",
        salaryMax: data.salaryMax ?? "",
        websiteLink: data.websiteLink || "",
        vacancy: data.vacancy ?? "",
        jobType: data.jobType || "",
        workLocation: data.workLocation || "",
        minExperience: data.minExperience ?? "",
        benefits: data.benefits?.join(", ") || "",
      });
      setSkillIds(data.skillIds || []);
    } catch (err) {
      setFetchError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...jobData,
      minExperience: jobData.minExperience ? Number(jobData.minExperience) : null,
      salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
      salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
      vacancy: jobData.vacancy ? Number(jobData.vacancy) : null,
      skillIds,
      benefits: jobData.benefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      await updateJob(jobId, payload);
      addToast("Job updated successfully!", "success");
      navigate("/hire/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      addToast("Failed to update job. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#2557A7] text-4xl mx-auto mb-4" />
          <p className="text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-md">
          <p className="text-red-500 mb-4">{fetchError}</p>
          <button
            onClick={() => navigate("/hire/jobs")}
            className="bg-[#2557A7] text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/hire/jobs")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition mb-4"
          >
            <FaArrowLeft /> Back to Jobs
          </button>

          <h1 className="text-4xl font-bold text-slate-800">Edit Job Posting</h1>
          <p className="text-slate-500 mt-2">
            Update the details of your job listing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          {/* Basic Information */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  placeholder="Senior Java Developer"
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="Pune, Maharashtra"
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                >
                  <option value="">Select Job Type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Work Location
                </label>
                <select
                  name="workLocation"
                  value={jobData.workLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                >
                  <option value="">Select Work Mode</option>
                  <option value="ON_SITE">On Site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Compensation
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={jobData.salaryMin}
                  onChange={handleChange}
                  placeholder="600000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={jobData.salaryMax}
                  onChange={handleChange}
                  placeholder="1200000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Vacancies
                </label>
                <input
                  type="number"
                  name="vacancy"
                  value={jobData.vacancy}
                  onChange={handleChange}
                  placeholder="5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>
            </div>            </div>

          {/* Minimum Experience */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Experience Required
            </h2>
            <div className="grid md:grid-cols-1 gap-6 max-w-sm">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  name="minExperience"
                  value={jobData.minExperience}
                  onChange={handleChange}
                  placeholder="2"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Job Description
            </h2>
            <textarea
              rows="8"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              placeholder="Describe responsibilities, requirements, and expectations..."
              maxLength={2000}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{jobData.description.length}/2000</p>
          </div>

          {/* Skills and Benefits */}                    <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Required Skills
              </label>
              <SkillPicker
                selectedIds={skillIds}
                onChange={setSkillIds}
                placeholder="Search and select skills from the database..."
              />
              <p className="text-sm text-slate-400 mt-2">
                Select skills from the database. Only admins can add new skills.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Benefits
              </label>
              <textarea
                rows="4"
                name="benefits"
                value={jobData.benefits}
                onChange={handleChange}
                placeholder="Health Insurance, Work From Home, Bonus"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 resize-none"
              />
              <p className="text-sm text-slate-400 mt-2">
                Separate benefits using commas.
              </p>
            </div>
          </div>

          {/* Website */}
          <div className="mb-10">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Company Website
            </label>
            <input
              type="text"
              name="websiteLink"
              value={jobData.websiteLink}
              onChange={handleChange}
              placeholder="https://company.com"
              maxLength={255}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/hire/jobs")}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Updating...
                </>
              ) : (
                "Update Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
