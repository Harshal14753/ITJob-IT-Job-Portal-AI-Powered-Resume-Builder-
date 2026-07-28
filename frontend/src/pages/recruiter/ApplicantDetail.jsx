import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaDownload,
  FaStar,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaProjectDiagram,
  FaSpinner,
  FaCalendarAlt,
  FaBuilding,
  FaPaperPlane,
} from "react-icons/fa";
import {
  getApplicantById,
  updateApplicationStatus,
} from "../../services/JobService";
import {
  createOrGetConversation,
  sendRecruiterMessage,
} from "../../services/MessageService";
import { useToast } from "../../components/Toast";

const statusConfig = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  REVIEWING: {
    label: "Reviewing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  INTERVIEWING: {
    label: "Interviewing",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

const quickStatusActions = [
  { key: "REVIEWING", label: "Mark Reviewing", color: "bg-blue-600 hover:bg-blue-700" },
  { key: "INTERVIEWING", label: "Schedule Interview", color: "bg-purple-600 hover:bg-purple-700" },
  { key: "ACCEPTED", label: "Accept", color: "bg-green-600 hover:bg-green-700" },
  { key: "REJECTED", label: "Reject", color: "bg-red-600 hover:bg-red-700" },
];

const ApplicantDetail = () => {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Inline messaging state
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    fetchApplicant();
  }, [jobId, applicationId]);

  const fetchApplicant = async () => {
    setLoading(true);
    try {
      const data = await getApplicantById(jobId, applicationId);
      setApplicant(data);
    } catch (err) {
      console.error("Error fetching applicant:", err);
      addToast("Failed to load applicant details.", "error");
      navigate(`/hire/jobs/${jobId}/applicants`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMsg) return;
    if (!applicant.candidateId) {
      addToast("Cannot message this applicant.", "error");
      return;
    }
    setSendingMsg(true);
    try {
      // Create or get existing conversation and send the message
      const conv = await createOrGetConversation(applicant.candidateId);
      await sendRecruiterMessage(conv.id, messageText.trim());
      addToast("Message sent successfully!", "success");
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      addToast(error.response?.data || "Failed to send message.", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(jobId, applicationId, newStatus);
      setApplicant((prev) => ({ ...prev, status: newStatus }));
      addToast(`Status updated to ${newStatus.replace(/_/g, " ")}.`, "success");
    } catch (err) {
      console.error("Error updating status:", err);
      addToast("Failed to update status. Please try again.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const extractFileName = (publicId) => {
    if (!publicId) return null;
    const idPart = publicId.substring(publicId.lastIndexOf("/") + 1);
    const idx = idPart.indexOf("_");
    return idx >= 0 ? idPart.substring(idx + 1) : idPart;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-500">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  if (!applicant) return null;

  const config = statusConfig[applicant.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(`/hire/jobs/${jobId}/applicants`)}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
          >
            <FaArrowLeft /> Back to Applicants
          </button>

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl font-bold">
                {applicant.fullName
                  ? applicant.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : "?"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {applicant.fullName || "Unknown Candidate"}
                </h1>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <FaEnvelope className="text-sm" /> {applicant.email}
                </p>
              </div>
            </div>

            <div className={`px-5 py-3 rounded-xl border ${config.bg} ${config.border}`}>
              <span className={`text-lg font-bold ${config.text}`}>{config.label}</span>
              <p className="text-xs text-gray-500 mt-1">
                Applied {formatDate(applicant.applicationDate)}
              </p>
              {applicant.statusUpdatedAt && applicant.status !== "PENDING" && (
                <p className="text-xs text-gray-400 mt-1">
                  Status updated {formatDateTime(applicant.statusUpdatedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {quickStatusActions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleStatusUpdate(action.key)}
                disabled={updating || applicant.status === action.key}
                className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${action.color}`}
              >
                {updating ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {applicant.about || "No about information provided."}
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaBriefcase className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Experience</h2>
              </div>
              {applicant.experiences && applicant.experiences.length > 0 ? (
                <div className="space-y-6">
                  {applicant.experiences.map((exp, i) => (
                    <div key={i} className="border-l-2 border-blue-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.jobRole}</h3>
                      <p className="text-blue-600 text-sm">{exp.companyName}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {formatDate(exp.startDate)} — {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No experience listed.</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <FaGraduationCap className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
              </div>
              {applicant.educations && applicant.educations.length > 0 ? (
                <div className="space-y-6">
                  {applicant.educations.map((edu, i) => (
                    <div key={i} className="border-l-2 border-green-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-green-600 text-sm">{edu.institutionName}</p>
                      {(edu.cgpa || edu.percentage) && (
                        <p className="text-gray-500 text-sm mt-1">
                          {edu.cgpa ? `CGPA: ${edu.cgpa}` : ""}
                          {edu.cgpa && edu.percentage ? " | " : ""}
                          {edu.percentage ? `${edu.percentage}%` : ""}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No education listed.</p>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FaProjectDiagram className="text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Projects</h2>
              </div>
              {applicant.projects && applicant.projects.length > 0 ? (
                <div className="space-y-6">
                  {applicant.projects.map((proj, i) => (
                    <div key={i} className="border-l-2 border-purple-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{proj.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{proj.description}</p>
                      {proj.websiteLink && (
                        <a
                          href={proj.websiteLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No projects listed.</p>
              )}
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FaCertificate className="text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Certificates</h2>
              </div>
              {applicant.certificates && applicant.certificates.length > 0 ? (
                <div className="space-y-4">
                  {applicant.certificates.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <FaCertificate className="text-orange-500 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{cert.certificateName}</p>
                        {cert.issuedBy && (
                          <p className="text-sm text-gray-500">Issued by {cert.issuedBy}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No certificates listed.</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact & Links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {applicant.phoneNo && (
                  <div className="flex items-center gap-3 text-sm">
                    <FaPhone className="text-gray-400 w-4" />
                    <span>{applicant.phoneNo}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <FaEnvelope className="text-gray-400 w-4" />
                  <span>{applicant.email}</span>
                </div>
                {applicant.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <FaMapMarkerAlt className="text-gray-400 w-4" />
                    <span>{applicant.address}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap gap-3">
                {applicant.linkedInLink && (
                  <a href={applicant.linkedInLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition">
                    <FaLinkedin /> LinkedIn
                  </a>
                )}
                {applicant.githubLink && (
                  <a href={applicant.githubLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition">
                    <FaGithub /> GitHub
                  </a>
                )}
                {applicant.portfolioLink && (
                  <a href={applicant.portfolioLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm hover:bg-green-100 transition">
                    <FaGlobe /> Portfolio
                  </a>
                )}
                {applicant.resumeUrl && (
                  <a href={applicant.resumeUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm hover:bg-red-100 transition w-full justify-center">
                    <FaDownload /> {extractFileName(applicant.resumePublicId) || "Download Resume"}
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FaCode className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Skills</h2>
              </div>
              {applicant.skills && applicant.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No skills listed.</p>
              )}
            </div>

            {/* Inline Message Composer */}
            {applicant.candidateId && (() => {
              const name = applicant.fullName || "this candidate";
              return (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Send Message</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Send a direct message to {name.split(" ")[0]}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sendingMsg}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:ring-2 outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendingMsg}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendingMsg ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPaperPlane />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
