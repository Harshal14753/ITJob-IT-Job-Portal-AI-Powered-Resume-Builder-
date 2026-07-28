import React, { useState, useEffect } from "react";
import { createJob, saveDraft, getAllSkills } from "../../services/JobService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import SkillPicker from "../../components/SkillPicker";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaMapMarkerAlt,
  FaBriefcase,
  FaAward,
  FaGlobe,
  FaListAlt,
  FaStar,
  FaSpinner,
  FaSave,
} from "react-icons/fa";

const CreateJob = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [allSkills, setAllSkills] = useState([]);

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

  // Fetch all skills for review page display
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setAllSkills(data);
      } catch {
        // Silently fail — skills just won't show names on review
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Step 1: Form submit -> transition to review
  const handleReview = (e) => {
    e.preventDefault();
    if (!jobData.title.trim()) {
      addToast("Job title is required.", "error");
      return;
    }
    if (!jobData.description.trim()) {
      addToast("Job description is required.", "error");
      return;
    }
    setShowReview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2: Publish from review page
  const handlePublish = async () => {
    const payload = buildPayload();

    setSubmitting(true);
    try {
      await createJob(payload);
      addToast("Job posted successfully!", "success");
      navigate("/hire/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      addToast(
        error.response?.data || "Failed to create job. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buildPayload = () => ({
    ...jobData,
    minExperience: jobData.minExperience ? Number(jobData.minExperience) : null,
    salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
    salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
    vacancy: jobData.vacancy ? Number(jobData.vacancy) : null,
    skillIds,
    benefits: jobData.benefits
      .split(",")
      .map((benefit) => benefit.trim())
      .filter(Boolean),
  });

  const handleEdit = () => {
    setShowReview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    setSavingDraft(true);
    try {
      await saveDraft(payload);
      addToast("Job saved as draft!", "success");
      navigate("/hire/jobs");
    } catch (error) {
      console.error("Error saving draft:", error);
      addToast(error.response?.data || "Failed to save draft.", "error");
    } finally {
      setSavingDraft(false);
    }
  };

  // Helpers for review display
  const selectedSkillNames = allSkills
    .filter((s) => skillIds.includes(s.id))
    .map((s) => s.skill);

  const formatSalary = (val) =>
    val ? `\u20B9${(Number(val) / 100000).toFixed(1)} LPA` : null;

  const jobTypeLabels = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract",
  };

  const workLocationLabels = {
    ON_SITE: "On Site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
  };

  // Review Page
  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition"
          >
            <FaArrowLeft /> Back to form
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Review Your Job Posting</h1>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">
              Please review all the details below before publishing. You can go back and edit if needed.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">{jobData.title || "Untitled Position"}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-blue-100 text-sm">
                {jobData.location && (
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt size={12} /> {jobData.location}
                  </span>
                )}
                {jobData.jobType && (
                  <span className="flex items-center gap-1.5">
                    <FaBriefcase size={12} /> {jobTypeLabels[jobData.jobType] || jobData.jobType}
                  </span>
                )}
                {jobData.workLocation && (
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs">
                    {workLocationLabels[jobData.workLocation] || jobData.workLocation}
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {jobData.salaryMin && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Min Salary</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">{formatSalary(jobData.salaryMin)}</p>
                  </div>
                )}
                {jobData.salaryMax && (
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-500 font-medium uppercase tracking-wider">Max Salary</p>
                    <p className="text-lg font-bold text-green-700 mt-1">{formatSalary(jobData.salaryMax)}</p>
                  </div>
                )}
                {jobData.vacancy && (
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wider">Vacancies</p>
                    <p className="text-lg font-bold text-purple-700 mt-1">{jobData.vacancy}</p>
                  </div>
                )}
                {jobData.minExperience && (
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-xs text-orange-500 font-medium uppercase tracking-wider">Min Exp.</p>
                    <p className="text-lg font-bold text-orange-700 mt-1">{jobData.minExperience} yrs</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaListAlt className="text-blue-500" /> Job Description
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {jobData.description || "No description provided."}
                </p>
              </div>

              {selectedSkillNames.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaStar className="text-yellow-500" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkillNames.map((name, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium">{name}</span>
                    ))}
                  </div>
                </div>
              )}

              {jobData.benefits && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaAward className="text-green-500" /> Benefits & Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobData.benefits.split(",").map((b) => b.trim()).filter(Boolean).map((benefit, i) => (
                      <span key={i} className="bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-full">{benefit}</span>
                    ))}
                  </div>
                </div>
              )}

              {jobData.websiteLink && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FaGlobe className="text-blue-500" /> Company Website
                  </h3>
                  <a href={jobData.websiteLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{jobData.websiteLink}</a>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button onClick={handleEdit} disabled={submitting || savingDraft} className="px-8 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-2">
              <FaEdit /> Edit Details
            </button>
            <button onClick={handleSaveDraft} disabled={submitting || savingDraft} className="px-8 py-3.5 rounded-xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2">
              {savingDraft ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save as Draft</>}
            </button>
            <button onClick={handlePublish} disabled={submitting || savingDraft} className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2 min-w-[200px]">
              {submitting ? <><FaSpinner className="animate-spin" /> Publishing...</> : <><FaCheckCircle /> Publish Job</>}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">By publishing, you agree that the job will be visible to all candidates immediately.</p>
        </div>
      </div>
    );
  }

  // Form Page
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Create Job Posting</h1>
          <p className="text-slate-500 mt-2">Reach talented IT professionals by creating a detailed job listing.</p>
        </div>

        <form onSubmit={handleReview} className="bg-white rounded-3xl shadow-sm p-8">

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

                    {/* Experience & Salary */}
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

                        </div>
                    </div>

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

                    {/* Description */}
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

                    {/* Skills and Benefits */}
                    <div className="grid md:grid-cols-2 gap-8 mb-10">

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
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaCheckCircle /> Review &amp; Publish
            </button>
                    </div>

        </form>
      </div>
    </div>
  );
};

export default CreateJob;