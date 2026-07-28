import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaBookmark,
  FaTrash,
  FaStar,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { getSavedCandidates, unsaveCandidate } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  REVIEWING: { label: "Reviewing", bg: "bg-blue-100", text: "text-blue-700" },
  INTERVIEWING: { label: "Interviewing", bg: "bg-purple-100", text: "text-purple-700" },
  ACCEPTED: { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  WITHDRAWN: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-700" },
};

const SavedCandidates = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await getSavedCandidates();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching saved candidates:", error);
      addToast("Failed to load saved candidates.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (candidateId) => {
    setRemovingId(candidateId);
    try {
      await unsaveCandidate(candidateId);
      setCandidates((prev) => prev.filter((c) => c.candidateId !== candidateId));
    } catch (error) {
      console.error("Error removing candidate:", error);
      addToast("Failed to remove candidate.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.skills?.some((s) => s.toLowerCase().includes(term)) ||
      c.latestExperienceTitle?.toLowerCase().includes(term)
    );
  });

  const extractFileName = (publicId) => {
    if (!publicId) return null;
    const idPart = publicId.substring(publicId.lastIndexOf("/") + 1);
    const idx = idPart.indexOf("_");
    return idx >= 0 ? idPart.substring(idx + 1) : idPart;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button onClick={() => navigate("/hire/dashboard")} className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaBookmark className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Saved Candidates</h1>
              <p className="text-blue-100 mt-1">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Loading saved candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <FaBookmark className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              {candidates.length === 0 ? "No Saved Candidates" : "No Matching Candidates"}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {candidates.length === 0
                ? "Save interesting candidates while browsing to review them later."
                : "Try adjusting your search."}
            </p>
            {candidates.length === 0 && (
              <button onClick={() => navigate("/hire/find-cvs")} className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                Browse Candidates
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.candidateId} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {candidate.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.fullName || "Unknown"}</h3>
                      <p className="text-sm text-gray-500">{candidate.email}</p>

                      {candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {candidate.skills.slice(0, 6).map((skill, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                          ))}
                          {candidate.skills.length > 6 && (
                            <span className="text-xs text-gray-400 flex items-center">+{candidate.skills.length - 6} more</span>
                          )}
                        </div>
                      )}

                      {(candidate.latestExperienceTitle || candidate.latestExperienceCompany) && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                          <FaStar className="text-yellow-500 text-xs" />
                          <span>
                            {candidate.latestExperienceTitle}
                            {candidate.latestExperienceCompany && ` at ${candidate.latestExperienceCompany}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        {candidate.phoneNo && <span className="text-xs text-gray-500"><FaPhone className="inline mr-1" />{candidate.phoneNo}</span>}
                        {candidate.linkedInLink && <a href={candidate.linkedInLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="LinkedIn"><FaLinkedin /></a>}
                        {candidate.githubLink && <a href={candidate.githubLink} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-gray-900" title="GitHub"><FaGithub /></a>}
                        {candidate.portfolioLink && <a href={candidate.portfolioLink} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-800" title="Portfolio"><FaGlobe /></a>}
                        {candidate.resumeUrl && (
                          <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs" title="Download Resume">
                            <FaDownload /> {extractFileName(candidate.resumePublicId) || "Resume"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
                    <button
                      onClick={() => handleUnsave(candidate.candidateId)}
                      disabled={removingId === candidate.candidateId}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                    >
                      {removingId === candidate.candidateId ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                      Remove
                    </button>
                  </div>
                </div>

                {candidate.about && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">{candidate.about}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCandidates;
