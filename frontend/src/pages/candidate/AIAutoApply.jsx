import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaRobot,
  FaPercent,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaStar,
  FaThumbsUp,
  FaBuilding,
  FaCog,
  FaCheckDouble,
  FaTimesCircle,
  FaSave,
  FaClock,
} from "react-icons/fa";
import http from "../../config/AxiosHelper";
import { useToast } from "../../components/Toast";
import { getAIApplyReviewJobs, applyForReviewJob } from "../../services/JobService";

const JOB_TYPES = [
  { value: "", label: "Any Job Type" },
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

const WORK_LOCATIONS = [
  { value: "", label: "Any Work Location" },
  { value: "REMOTE", label: "Remote" },
  { value: "ON_SITE", label: "On-Site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "FLEXIBLE", label: "Flexible" },
];

const AIAutoApply = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Settings state
  const [enabled, setEnabled] = useState(false);
  const [matchThreshold, setMatchThreshold] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const [preferredSkills, setPreferredSkills] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [preferredJobType, setPreferredJobType] = useState("");
  const [preferredMinSalary, setPreferredMinSalary] = useState("");
  const [preferredWorkLocation, setPreferredWorkLocation] = useState("");
  const [preferredTitles, setPreferredTitles] = useState("");
  const [preferredMinExperience, setPreferredMinExperience] = useState("");

  // Review jobs state
  const [reviewJobs, setReviewJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [skippedJobs, setSkippedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentJob = reviewJobs[currentIndex];
  const totalJobs = reviewJobs.length;
  const remainingJobs = reviewJobs.length - currentIndex;

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get("/candidate/ai-apply/settings");
      const data = res.data;
      setEnabled(data.enabled);
      setMatchThreshold(data.matchThreshold);
      setPreferredSkills(data.preferredSkills || "");
      setPreferredLocation(data.preferredLocation || "");
      setPreferredJobType(data.preferredJobType || "");
      setPreferredMinSalary(data.preferredMinSalary != null ? String(data.preferredMinSalary) : "");
      setPreferredWorkLocation(data.preferredWorkLocation || "");
      setPreferredTitles(data.preferredTitles || "");
      setPreferredMinExperience(data.preferredMinExperience != null ? String(data.preferredMinExperience) : "");
    } catch (error) {
      console.error("Error fetching AI apply settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch review jobs
  const fetchReviewJobs = useCallback(async () => {
    setLoadingJobs(true);
    setCurrentIndex(0);
    setAppliedJobs(new Set());
    setSkippedJobs(new Set());
    setCompleted(false);
    try {
      const data = await getAIApplyReviewJobs();
      setReviewJobs(data || []);
    } catch (error) {
      console.error("Error fetching review jobs:", error);
      addToast("Failed to load matching jobs.", "error");
      setReviewJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, [addToast]);

  // Load jobs when settings are first loaded
  useEffect(() => {
    if (!loading) {
      fetchReviewJobs();
    }
  }, [loading, fetchReviewJobs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await http.put("/candidate/ai-apply/settings", {
        enabled,
        matchThreshold,
        preferredSkills: preferredSkills.trim() || null,
        preferredLocation: preferredLocation.trim() || null,
        preferredJobType: preferredJobType || null,
        preferredMinSalary: preferredMinSalary ? Number(preferredMinSalary) : null,
        preferredWorkLocation: preferredWorkLocation || null,
        preferredTitles: preferredTitles.trim() || null,
        preferredMinExperience: preferredMinExperience ? Number(preferredMinExperience) : null,
      });
      addToast("Settings saved! Refreshing job matches...", "success");
      // Re-fetch jobs with new preferences
      fetchReviewJobs();
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast("Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!currentJob || applying) return;

    setApplying(true);
    try {
      await applyForReviewJob(currentJob.id);
      setAppliedJobs((prev) => new Set(prev).add(currentJob.id));
      addToast("Applied successfully!", "success");
      moveToNext();
    } catch (error) {
      console.error("Error applying:", error);
      if (error.response?.status === 409) {
        setAppliedJobs((prev) => new Set(prev).add(currentJob.id));
        addToast("Already applied to this job.", "info");
        moveToNext();
      } else {
        addToast("Failed to apply. Please try again.", "error");
      }
    } finally {
      setApplying(false);
    }
  };

  const handleSkip = () => {
    if (!currentJob) return;
    setSkippedJobs((prev) => new Set(prev).add(currentJob.id));
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex + 1 >= totalJobs) {
      setCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const getMatchColor = (value) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchBg = (value) => {
    if (value >= 80) return "bg-green-100 border-green-300 text-green-700";
    if (value >= 60) return "bg-yellow-100 border-yellow-300 text-yellow-700";
    if (value >= 40) return "bg-orange-100 border-orange-300 text-orange-700";
    return "bg-red-100 border-red-300 text-red-700";
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

  const formatJobType = (type) =>
    type ? type.replace(/_/g, " ") : "—";

  const formatWorkLocation = (loc) =>
    loc ? loc.replace(/_/g, " ") : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-purple-200 hover:text-white transition mb-4 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <FaRobot className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                AI Job Matches
              </h1>
              <p className="text-purple-200 mt-1 text-lg">
                Review matching jobs one-by-one — apply or skip each one
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 -mt-4">
        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaCog className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Matching Preferences</p>
              <p className="text-xs text-gray-500">
                {showSettings ? "Click to hide" : "Adjust skills, location, job type, and more"}
              </p>
            </div>
          </div>
          <FaCog className={`text-gray-400 transition-transform ${showSettings ? "rotate-90" : ""}`} />
        </button>

        {/* Settings Panel (collapsible) */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Preferred Titles */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaStar className="text-amber-500" /> Job Titles
                </label>
                <input
                  type="text"
                  value={preferredTitles}
                  onChange={(e) => setPreferredTitles(e.target.value)}
                  placeholder="e.g. Software Engineer, Full Stack"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {/* Preferred Skills */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaRobot className="text-purple-500" /> Required Skills
                </label>
                <input
                  type="text"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  placeholder="e.g. Java, React, Python"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {/* Preferred Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaMapMarkerAlt className="text-red-500" /> Location
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Bangalore"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {/* Job Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaBriefcase className="text-blue-500" /> Job Type
                </label>
                <select
                  value={preferredJobType}
                  onChange={(e) => setPreferredJobType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white"
                >
                  {JOB_TYPES.map((jt) => (
                    <option key={jt.value} value={jt.value}>{jt.label}</option>
                  ))}
                </select>
              </div>
              {/* Work Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaBriefcase className="text-green-500" /> Work Mode
                </label>
                <select
                  value={preferredWorkLocation}
                  onChange={(e) => setPreferredWorkLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white"
                >
                  {WORK_LOCATIONS.map((wl) => (
                    <option key={wl.value} value={wl.value}>{wl.label}</option>
                  ))}
                </select>
              </div>
              {/* Min Salary */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaMoneyBillWave className="text-emerald-500" /> Min Salary
                </label>
                <input
                  type="number"
                  min="0"
                  value={preferredMinSalary}
                  onChange={(e) => setPreferredMinSalary(e.target.value)}
                  placeholder="e.g. 600000"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {/* Min Experience */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaClock className="text-cyan-500" /> Max Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={preferredMinExperience}
                  onChange={(e) => setPreferredMinExperience(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {/* Match Threshold */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <FaPercent className="text-purple-600" /> Match Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-lg font-bold text-purple-600 min-w-[3rem] text-center">
                    {matchThreshold}%
                  </span>
                </div>
              </div>

            </div>
            <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving ? "Saving..." : "Save & Refresh"}
              </button>
            </div>
          </div>
        )}

        {/* Loading Jobs */}
        {loadingJobs && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-20 text-center">
            <FaSpinner className="animate-spin text-indigo-600 text-5xl mx-auto mb-5" />
            <p className="text-gray-600 text-lg">Finding matching jobs...</p>
          </div>
        )}

        {/* No Jobs Found */}
        {!loadingJobs && totalJobs === 0 && !completed && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-5">
              <FaRobot className="text-4xl text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Matching Jobs Found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any jobs matching your current preferences. Try
              expanding your filters or check back later for new opportunities.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Adjust Preferences
            </button>
          </div>
        )}

        {/* Review Card */}
        {!loadingJobs && currentJob && !completed && (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">
                  Job {currentIndex + 1} of {totalJobs}
                </span>
                <span className="text-gray-400">
                  {appliedJobs.size} applied · {skippedJobs.size} skipped
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / totalJobs) * 100}%` }}
                />
              </div>
            </div>

            {/* Job Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              {/* Card Header with Match Score */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 pt-8 pb-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <FaBuilding className="text-2xl text-indigo-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentJob.title}
                      </h2>
                      <p className="text-indigo-600 font-medium text-lg mt-0.5">
                        {currentJob.companyName}
                      </p>
                    </div>
                  </div>
                  {/* Match Score Badge */}
                  <div
                    className={`flex flex-col items-center px-5 py-3 rounded-2xl border-2 ${getMatchBg(currentJob.matchScore)}`}
                  >
                    <FaStar className="text-lg mb-0.5" />
                    <span className="text-2xl font-black">{currentJob.matchScore}%</span>
                    <span className="text-xs font-medium">Match</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-8 py-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <FaMapMarkerAlt className="text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{currentJob.location || "—"}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <FaBriefcase className="text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{formatJobType(currentJob.jobType)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <FaMoneyBillWave className="text-purple-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Salary</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{formatSalaryRange(currentJob.salaryMin, currentJob.salaryMax)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <FaBriefcase className="text-orange-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Work Mode</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{formatWorkLocation(currentJob.workLocation)}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-7 whitespace-pre-line text-sm">
                    {currentJob.description}
                  </p>
                </div>

                {/* Skills */}
                {currentJob.skills && currentJob.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Required */}
                {currentJob.minExperience != null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-gray-400" />
                    <span><strong>Min Experience:</strong> {currentJob.minExperience} years</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button
                  onClick={handleSkip}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                >
                  <FaTimesCircle className="text-xl" />
                  Skip
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {applying ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    <FaThumbsUp className="text-xl" />
                  )}
                  {applying ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {!loadingJobs && completed && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <FaCheckDouble className="text-4xl text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              All Reviewed!
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You've reviewed all {totalJobs} matching jobs.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8 max-w-sm mx-auto">
              <div className="bg-green-50 rounded-2xl p-5">
                <FaCheckCircle className="text-green-600 text-2xl mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-700">{appliedJobs.size}</p>
                <p className="text-sm text-green-600 font-medium">Applied</p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-5">
                <FaTimesCircle className="text-gray-400 text-2xl mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-600">{skippedJobs.size}</p>
                <p className="text-sm text-gray-500 font-medium">Skipped</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchReviewJobs}
                className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-700 font-semibold hover:bg-purple-50 transition"
              >
                Refresh Matches
              </button>
              <button
                onClick={() => navigate("/applications")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-md"
              >
                View Applications
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!completed && (
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              Jobs are sorted by match score (highest first). Click <strong>Apply</strong> to apply
              directly, or <strong>Skip</strong> to pass. Adjust your preferences above to refine results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAutoApply;
