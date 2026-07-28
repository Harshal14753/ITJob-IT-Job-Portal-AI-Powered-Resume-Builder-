import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBookmark,
  FaBookmark as FaBookmarkSolid,
  FaStar,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaDownload,
  FaEnvelope,
  FaSpinner,
} from "react-icons/fa";
import { searchCandidates, saveCandidate, unsaveCandidate } from "../../services/JobService";
import { useToast } from "../../components/Toast";

const SearchTalent = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  const doSearch = async (skipLoading) => {
    if (!skipLoading) setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      const data = await searchCandidates(params);
      setCandidates(data);
    } catch (error) {
      console.error("Error searching candidates:", error);
      addToast("Failed to search candidates.", "error");
    } finally {
      if (!skipLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => doSearch(false), 300);
    return () => clearTimeout(timer);
  }, [search, location]);

  const toggleSave = async (candidateId) => {
    setSavingId(candidateId);
    try {
      if (savedIds.has(candidateId)) {
        await unsaveCandidate(candidateId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(candidateId);
          return next;
        });
      } else {
        await saveCandidate(candidateId);
        setSavedIds((prev) => new Set(prev).add(candidateId));
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      addToast("Failed to save candidate.", "error");
    } finally {
      setSavingId(null);
    }
  };

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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaSearch className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Search Talent</h1>
              <p className="text-blue-100 mt-1">Find the best candidates from our database.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center border border-gray-300 rounded-xl px-4 h-12 transition">
              <FaSearch className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, skills, or job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 h-12 transition lg:w-72">
              <FaMapMarkerAlt className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => doSearch(false)}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Searching talent pool...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-900">{candidates.length}</span> candidate{candidates.length !== 1 ? "s" : ""}
            </p>

            <div className="space-y-4">
              {candidates.map((candidate) => {
                const isSaved = savedIds.has(candidate.candidateId);
                const isSaving = savingId === candidate.candidateId;
                return (
                  <div key={candidate.candidateId} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                          {candidate.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{candidate.fullName}</h3>
                          <p className="text-sm text-gray-500">{candidate.email}</p>

                          {candidate.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {Array.from(candidate.skills).slice(0, 5).map((skill, i) => (
                                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                              ))}
                              {candidate.skills.size > 5 && (
                                <span className="text-xs text-gray-400 flex items-center">+{candidate.skills.size - 5} more</span>
                              )}
                            </div>
                          )}

                          {(candidate.latestExperienceTitle || candidate.latestExperienceCompany) && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                              <FaStar className="text-yellow-500 text-xs" />
                              <span>{candidate.latestExperienceTitle}{candidate.latestExperienceCompany && ` at ${candidate.latestExperienceCompany}`}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-3">
                            {candidate.address && <span className="text-xs text-gray-500"><FaMapMarkerAlt className="inline mr-1" />{candidate.address}</span>}
                            {candidate.phoneNo && <span className="text-xs text-gray-500">{candidate.phoneNo}</span>}
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
                          onClick={() => toggleSave(candidate.candidateId)}
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition disabled:opacity-50 ${
                            isSaved
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {isSaving ? (
                            <FaSpinner className="animate-spin" />
                          ) : isSaved ? (
                            <FaBookmarkSolid />
                          ) : (
                            <FaBookmark />
                          )}
                          {isSaved ? "Saved" : "Save"}
                        </button>

                        <button
                          onClick={() => {
                            const token = localStorage.getItem("accessToken");
                            if (!token) {
                              navigate("/hire/login");
                              return;
                            }
                            navigate(`/hire/messages?start=${candidate.candidateId}`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                        >
                          <FaEnvelope />
                          Message
                        </button>
                      </div>
                    </div>

                    {candidate.about && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">{candidate.about}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {candidates.length === 0 && !loading && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <FaSearch className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No Candidates Found</h3>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchTalent;
