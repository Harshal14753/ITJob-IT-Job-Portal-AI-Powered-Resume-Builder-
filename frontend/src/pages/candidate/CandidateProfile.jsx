import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaInfoCircle,
  FaBriefcase,
  FaGraduationCap,
  FaCertificate,
  FaCode,
  FaFileAlt,
  FaArrowLeft,
  FaSpinner,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEnvelope,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaBuilding,
  FaGraduationCap as FaDegree,
  FaStar,
  FaLink,
  FaUpload,
  FaDownload,
  FaSignOutAlt,
} from "react-icons/fa";
import { getCandidateProfile, updateCandidateProfile, uploadResume, deleteResume, downloadResume } from "../../services/CandidateService";
import { useToast } from "../../components/Toast";
import SkillPicker from "../../components/SkillPicker";

// ── Color palette ─────────────────────────────────────────────────────────
const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", light: "bg-blue-50", border: "border-l-blue-500" },
  green: { bg: "bg-green-100", text: "text-green-700", light: "bg-green-50", border: "border-l-green-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", light: "bg-purple-50", border: "border-l-purple-500" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", light: "bg-cyan-50", border: "border-l-cyan-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", light: "bg-amber-50", border: "border-l-amber-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", light: "bg-emerald-50", border: "border-l-emerald-500" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", light: "bg-rose-50", border: "border-l-rose-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", light: "bg-orange-50", border: "border-l-orange-500" },
};

// ── Reusable components ───────────────────────────────────────────────────

const Section = ({ title, icon: Icon, color, action, children }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Icon className={c.text} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </div>
  );
};

const EntityCard = ({ item, color, fields, onEdit, onDelete }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`relative group flex border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${c.light}`}>
      {/* Accent bar */}
      <div className={`w-1.5 shrink-0 ${c.border}`} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Primary field (first field, displayed as title) */}
            {fields.length > 0 && item[fields[0].key] && (
              <h4 className="font-semibold text-gray-900 text-base truncate">
                {item[fields[0].key]}
              </h4>
            )}
            {/* Secondary fields */}
            <div className="mt-1.5 space-y-1">
              {fields.slice(1).map((f) => {
                const val = item[f.key];
                const displayVal = f.format ? f.format(val, item) : val;
                if (typeof val === "boolean" || !displayVal) return null;
                if (f.link) {
                  return (
                    <a
                      key={f.key}
                      href={val}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs hover:underline"
                    >
                      {f.icon && <f.icon size={11} />}
                      {displayVal}
                      <FaExternalLinkAlt size={9} />
                    </a>
                  );
                }
                return (
                  <p key={f.key} className="flex items-start gap-1.5 text-sm text-gray-600">
                    {f.icon && <f.icon size={12} className="text-gray-400 shrink-0 mt-0.5" />}
                    <span className="line-clamp-2">{displayVal}</span>
                  </p>
                );
              })}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-gray-400 hover:text-blue-600 transition"
              title="Edit"
            >
              <FaEdit size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition"
              title="Delete"
            >
              <FaTrash size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InlineForm = ({ fields, form, onChange, onSave, onCancel, saving, entity }) => {
  const renderInput = (f) => {
    const isDisabled = f.disabled ? f.disabled(form) : false;
    if (f.type === "select") {
      return (
        <select
          name={f.key}
          value={form[f.key] || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm bg-white"
        >
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return (
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            name={f.key}
            checked={!!form[f.key]}
            onChange={(e) => onChange({ target: { name: f.key, value: e.target.checked } })}
            className="w-4 h-4 text-[#2557A7] border-gray-300 rounded focus:ring-[#2557A7]/30"
          />
          <span className="text-sm text-gray-600">{f.label}</span>
        </label>
      );
    }
    if (f.textarea) {
      return (
        <textarea
          name={f.key}
          value={form[f.key] || ""}
          onChange={onChange}
          placeholder={f.placeholder}
          rows={2}
          maxLength={f.maxLength || 2000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition text-sm resize-none"
        />
      );
    }
    return (
      <input
        type={f.type || "text"}
        name={f.key}
        value={form[f.key] || ""}
        onChange={onChange}
        placeholder={f.placeholder}
        disabled={isDisabled}
        maxLength={f.maxLength || 255}
        className={`w-full border border-gray-300 rounded-lg px-3 h-10 outline-none focus:ring-2 focus:ring-[#2557A7]/20 focus:border-[#2557A7] transition text-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
      />
    );
  };

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-4">
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.fullWidth ? "md:col-span-2" : f.type === "checkbox" ? "md:col-span-2" : ""}>
            {f.type !== "checkbox" && (
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {f.label}{f.required ? <span className="text-red-500"> *</span> : null}
              </label>
            )}
            {f.type === "checkbox" ? renderInput(f) : renderInput(f)}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-white transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[#2557A7] text-white text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50"
        >
          {saving ? <><FaSpinner className="animate-spin inline mr-1" /> Saving...</> : `Save ${entity}`}
        </button>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (d) => {
  if (!d) return "";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  } catch {
    return d;
  }
};

const dateToInput = (d) => {
  if (!d) return "";
  if (typeof d === "string") return d.substring(0, 10);
  return "";
};

const jobTypeOptions = [
  { value: "", label: "Select type" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

// ── Main component ─────────────────────────────────────────────────────────

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);

  // Personal info
  const [personal, setPersonal] = useState({
    fullName: "", phoneNo: "", address: "", githubLink: "",
    linkedInLink: "", portfolioLink: "", about: "",
  });
  const [skillIds, setSkillIds] = useState([]);

  // Entity data
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);

  // Inline form state
  const [editingEntity, setEditingEntity] = useState(null); // { type, index?, data }

  // Edit personal info toggle
  const [editingPersonal, setEditingPersonal] = useState(false);

  // Resume upload state
  const [uploadingResume, setUploadingResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);

  // ── Logout handler ──
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("userData");
    localStorage.removeItem("email");
    navigate("/");
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getCandidateProfile();
      setProfile(data);
      setPersonal({
        fullName: data.fullName || "",
        phoneNo: data.phoneNo || "",
        address: data.address || "",
        githubLink: data.githubLink || "",
        linkedInLink: data.linkedInLink || "",
        portfolioLink: data.portfolioLink || "",
        about: data.about || "",
      });
      setSkillIds(data.skillIds ? [...data.skillIds] : []);
      setExperiences(data.experiences || []);
      setEducations(data.educations || []);
      setCertificates(data.certificates || []);
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Personal info handlers ──

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonal((prev) => ({ ...prev, [name]: value }));
  };



  // ── Resume handlers ──

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { addToast("Please upload a PDF or DOC file.", "error"); return; }
    if (file.size > 10 * 1024 * 1024) { addToast("File size must be less than 10MB.", "error"); return; }

    setUploadingResume(true);
    try {
      const data = await uploadResume(file);
      if (data.url) {
        // Update local state with the new resume URL
        setProfile((prev) => ({ ...prev, resumeUrl: data.url, resumePublicId: data.publicId }));
        addToast("Resume uploaded successfully!", "success");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      addToast(err?.response?.data?.error || "Failed to upload resume.", "error");
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;
    try {
      await deleteResume();
      setProfile((prev) => ({ ...prev, resumeUrl: null, resumePublicId: null }));
      addToast("Resume deleted.", "info");
    } catch (err) {
      console.error("Resume delete error:", err);
      addToast("Failed to delete resume.", "error");
    }
  };

  const handleResumeDownload = async () => {
    setDownloadingResume(true);
    try {
      const data = await downloadResume();
      if (data.downloadUrl) {
        // Create a temporary anchor and click it to trigger the download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Resume download started!", "success");
      } else {
        addToast(data.message || "No resume available to download.", "error");
      }
    } catch (err) {
      console.error("Resume download error:", err);
      // Fallback: try the stored resume URL directly with download flag
      if (profile?.resumeUrl) {
        const separator = profile.resumeUrl.includes("?") ? "&" : "?";
        const link = document.createElement("a");
        link.href = profile.resumeUrl + separator + "fl_attachment=true";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Resume download started.", "info");
      } else {
        addToast("Failed to download resume.", "error");
      }
    } finally {
      setDownloadingResume(false);
    }
  };

  // ── Entity CRUD helpers ──

  const entitySetters = {
    experience: setExperiences,
    education: setEducations,
    certificate: setCertificates,
    project: setProjects,
  };

  const entityGetters = {
    experience: experiences,
    education: educations,
    certificate: certificates,
    project: projects,
  };

  const getDefaultForm = (type) => {
    switch (type) {
      case "experience":
        return { jobRole: "", jobType: "", companyName: "", location: "", startDate: "", endDate: "", currentlyWorking: false, description: "" };
      case "education":
        return { institutionName: "", degree: "", fieldOfStudy: "", percentage: "", cgpa: "", startDate: "", endDate: "", currentlyPursuing: false };
      case "certificate":
        return { certificateName: "", issuingOrganization: "", issueDate: "", credentialId: "", credentialUrl: "", description: "" };
      case "project":
        return { title: "", description: "", websiteLink: "", startDate: "", endDate: "", currentlyWorking: false };
      default:
        return {};
    }
  };

  const openAddForm = (type) => {
    setEditingEntity({ type, index: null, data: getDefaultForm(type) });
  };

  const openEditForm = (type, index) => {
    const item = entityGetters[type]?.[index];
    if (!item) return;
    // Convert dates to input format
    const form = { ...item };
    Object.keys(form).forEach((key) => {
      if (key.toLowerCase().includes("date") && form[key] && typeof form[key] === "object") {
        form[key] = dateToInput(form[key]);
      }
      // Convert boolean strings from JSON
      if (typeof form[key] === "string" && (form[key] === "true" || form[key] === "false")) {
        form[key] = form[key] === "true";
      }
    });
    setEditingEntity({ type, index, data: form });
  };

  const closeForm = () => setEditingEntity(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditingEntity((prev) => {
      if (!prev) return prev;
      const newData = { ...prev.data, [name]: value };
      // If currentlyWorking/currentlyPursuing checkbox is checked, clear endDate
      if ((name === "currentlyWorking" || name === "currentlyPursuing") && value === true) {
        newData.endDate = "";
      }
      return { ...prev, data: newData };
    });
  };

  const saveEntity = () => {
    if (!editingEntity) return;
    const { type, index, data } = editingEntity;
    const setter = entitySetters[type];
    if (!setter) return;

    // Validate required fields
    if (type === "experience" && (!data.jobRole?.trim() || !data.companyName?.trim())) {
      addToast("Job Role and Company are required.", "error"); return;
    }
    if (type === "education" && (!data.institutionName?.trim() || !data.degree?.trim())) {
      addToast("Institution and Degree are required.", "error"); return;
    }
    if (type === "certificate" && !data.certificateName?.trim()) {
      addToast("Certificate name is required.", "error"); return;
    }
    if (type === "project" && !data.title?.trim()) {
      addToast("Project title is required.", "error"); return;
    }

    setter((prev) => {
      const list = [...prev];
      if (index !== null && index >= 0 && index < list.length) {
        list[index] = data;
      } else {
        list.push(data);
      }
      return list;
    });
    closeForm();
    addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved locally.`, "success");
  };

  const deleteEntity = (type, index) => {
    const setter = entitySetters[type];
    if (!setter) return;
    setter((prev) => prev.filter((_, i) => i !== index));
    if (editingEntity?.type === type && editingEntity?.index === index) {
      closeForm();
    }
    addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removed.`, "info");
  };

  // ── Global save ──

  const handleSave = async () => {
    if (!personal.fullName.trim()) {
      addToast("Full name is required.", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...personal,
        skillIds,
        resumeUrl: profile?.resumeUrl || "",
        experiences,
        educations,
        certificates,
        projects,
      };
      const updated = await updateCandidateProfile(payload);
      setProfile(updated);
      addToast("Profile saved successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      addToast("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render helpers ──

  const renderEntitySection = (type, icon, color, label, fields, emptyMsg) => {
    const items = entityGetters[type];
    const isFormOpen = editingEntity?.type === type;

    return (
      <Section
        title={`${label} (${items.length})`}
        icon={icon}
        color={color}
        action={
          <button
            type="button"
            onClick={() => openAddForm(type)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition"
          >
            <FaPlus size={10} /> Add
          </button>
        }
      >
        {/* Inline add/edit form */}
        {isFormOpen && renderInlineForm(type)}

        {/* Entity list */}
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <EntityCard
                key={idx}
                item={item}
                color={color}
                fields={fields}
                onEdit={() => openEditForm(type, idx)}
                onDelete={() => deleteEntity(type, idx)}
              />
            ))}
          </div>
        ) : (
          !isFormOpen && <p className="text-sm text-gray-400 italic">{emptyMsg}</p>
        )}
      </Section>
    );
  };

  const renderInlineForm = (type) => {
    const formConfigs = {
      experience: {
        fields: [
          { key: "jobRole", label: "Job Role *", placeholder: "Software Engineer", required: true, maxLength: 100 },
          { key: "jobType", label: "Job Type", type: "select", options: jobTypeOptions },
          { key: "companyName", label: "Company *", placeholder: "Google", required: true, maxLength: 100 },
          { key: "location", label: "Location", placeholder: "Mountain View, CA", maxLength: 255 },
          { key: "startDate", label: "Start Date", type: "date" },
          { key: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyWorking },
          { key: "currentlyWorking", label: "I currently work here", type: "checkbox" },
          { key: "description", label: "Description", placeholder: "Describe your role and achievements...", textarea: true, fullWidth: true, maxLength: 2000 },
        ],
        entity: "Experience",
      },
      education: {
        fields: [
          { key: "institutionName", label: "Institution *", placeholder: "Stanford University", required: true, maxLength: 100 },
          { key: "degree", label: "Degree *", placeholder: "B.S. Computer Science", required: true, maxLength: 100 },
          { key: "fieldOfStudy", label: "Field of Study", placeholder: "Computer Science", maxLength: 255 },
          { key: "percentage", label: "Percentage / GPA", placeholder: "85% or 3.8", maxLength: 20 },
          { key: "startDate", label: "Start Date", type: "date" },
          { key: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyPursuing },
          { key: "currentlyPursuing", label: "I am currently pursuing", type: "checkbox" },
        ],
        entity: "Education",
      },
      certificate: {
        fields: [
          { key: "certificateName", label: "Certificate Name *", placeholder: "AWS Solutions Architect", required: true, maxLength: 255 },
          { key: "issuingOrganization", label: "Organization", placeholder: "Amazon Web Services", maxLength: 255 },
          { key: "issueDate", label: "Issue Date", type: "date" },
          { key: "credentialId", label: "Credential ID", placeholder: "ABC123XYZ", maxLength: 255 },
          { key: "credentialUrl", label: "Credential URL", placeholder: "https://credential.com/verify/...", type: "url", maxLength: 500 },
          { key: "description", label: "Description", placeholder: "What skills did this demonstrate?", textarea: true, fullWidth: true, maxLength: 1000 },
        ],
        entity: "Certificate",
      },
      project: {
        fields: [
          { key: "title", label: "Project Title *", placeholder: "E-Commerce Platform", required: true, maxLength: 100 },
          { key: "websiteLink", label: "Demo / Website URL", placeholder: "https://myproject.com", type: "url", maxLength: 500 },
          { key: "startDate", label: "Start Date", type: "date" },
          { key: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyWorking },
          { key: "currentlyWorking", label: "I currently work on this", type: "checkbox" },
          { key: "description", label: "Description", placeholder: "Describe your project and tech stack...", textarea: true, fullWidth: true, maxLength: 500 },
        ],
        entity: "Project",
      },
    };

    const config = formConfigs[type];
    if (!config) return null;

    return (
      <InlineForm
        fields={config.fields}
        form={editingEntity?.data || getDefaultForm(type)}
        onChange={handleFormChange}
        onSave={saveEntity}
        onCancel={closeForm}
        saving={saving}
        entity={config.entity}
      />
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#2557A7] text-4xl mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-md">
          <p className="text-red-500 mb-4">Failed to load profile. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition">
              Back to Dashboard
            </button>
            <button onClick={fetchProfile} className="bg-[#2557A7] text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition text-sm"
          >
            <FaArrowLeft size={13} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Candidate</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
            >
              <FaSignOutAlt size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl mb-8 overflow-hidden shadow-lg">
          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <div className="flex items-center gap-5 sm:gap-7">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <FaUser className="text-3xl sm:text-4xl text-white" />
              </div>
              <div className="text-white flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">{profile?.fullName || "Your Name"}</h1>
                <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                  <FaEnvelope size={12} /> {profile?.email || ""}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition disabled:opacity-50 text-sm"
              >
                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save All</>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile save button */}
        <div className="sm:hidden flex justify-end mb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2557A7] text-white font-medium hover:bg-blue-800 transition disabled:opacity-50 text-sm shadow-sm"
          >
            {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save All Changes</>}
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Personal Info Section */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* ── Personal Info ── */}
            <Section
              title="Personal Information"
              icon={FaUser}
              color="blue"
              action={
                <button
                  type="button"
                  onClick={() => setEditingPersonal(!editingPersonal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                >
                  <FaEdit size={10} /> {editingPersonal ? "Cancel" : "Edit"}
                </button>
              }
            >
              {editingPersonal ? (
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" value={personal.fullName} onChange={handlePersonalChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input type="text" name="phoneNo" value={personal.phoneNo} onChange={handlePersonalChange} placeholder="+1 555-1234" maxLength={20} className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                    <input type="text" name="address" value={personal.address} onChange={handlePersonalChange} placeholder="123 Main St, City, Country" maxLength={255} className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">About Me</label>
                    <textarea name="about" value={personal.about} onChange={handlePersonalChange} rows={3} placeholder="Tell us about yourself..." maxLength={500} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition text-sm resize-none" />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-800 text-sm">{personal.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-800 text-sm">{profile?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-800 text-sm">{personal.phoneNo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                    <p className="text-gray-800 text-sm">{personal.address || "—"}</p>
                  </div>
                  {personal.about && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">About Me</p>
                      <p className="text-gray-800 text-sm leading-relaxed">{personal.about}</p>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* ── Online Presence ── */}
            {(personal.githubLink || personal.linkedInLink || personal.portfolioLink) && (
              <Section title="Online Presence" icon={FaGlobe} color="green">
                <div className="grid md:grid-cols-2 gap-4">
                  {personal.githubLink && (
                    <a href={personal.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                      <FaGithub className="text-gray-500 group-hover:text-gray-900" />
                      <span className="text-sm text-blue-600 group-hover:underline truncate">{personal.githubLink}</span>
                      <FaExternalLinkAlt size={10} className="text-gray-400 shrink-0" />
                    </a>
                  )}
                  {personal.linkedInLink && (
                    <a href={personal.linkedInLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                      <FaLinkedin className="text-blue-600" />
                      <span className="text-sm text-blue-600 group-hover:underline truncate">{personal.linkedInLink}</span>
                      <FaExternalLinkAlt size={10} className="text-gray-400 shrink-0" />
                    </a>
                  )}
                  {personal.portfolioLink && (
                    <a href={personal.portfolioLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                      <FaGlobe className="text-gray-500 group-hover:text-blue-600" />
                      <span className="text-sm text-blue-600 group-hover:underline truncate">{personal.portfolioLink}</span>
                      <FaExternalLinkAlt size={10} className="text-gray-400 shrink-0" />
                    </a>
                  )}
                </div>
              </Section>
            )}

            {/* ── Skills ── */}
            <Section title="Skills" icon={FaCheckCircle} color="purple">
              <SkillPicker
                selectedIds={skillIds}
                onChange={setSkillIds}
                placeholder="Search and select skills from the database..."
              />
              <p className="text-xs text-gray-400 mt-2">Select skills from the database. Only admins can add new skills.</p>
            </Section>

            {/* ── Experience ── */}
            {renderEntitySection(
              "experience", FaBriefcase, "cyan", "Experience",
              [
                { key: "jobRole", icon: FaStar },
                { key: "companyName", icon: FaBuilding },
              { key: "jobType" },
              { key: "location", icon: FaMapMarkerAlt },
              { key: "startDate", format: (v) => v ? formatDate(v) : "" },
              { key: "endDate", format: (v, item) => item?.currentlyWorking ? "Present" : (v ? formatDate(v) : "") },
              ],
              "No experience added yet. Click 'Add' to get started."
            )}

            {/* ── Education ── */}
            {renderEntitySection(
              "education", FaGraduationCap, "amber", "Education",
              [
                { key: "degree", icon: FaDegree },
                { key: "institutionName", icon: FaBuilding },
                { key: "fieldOfStudy" },
                { key: "percentage", icon: FaStar },
              ],
              "No education added yet. Click 'Add' to get started."
            )}

            {/* ── Certificates ── */}
            {renderEntitySection(
              "certificate", FaCertificate, "emerald", "Certificates",
              [
                { key: "certificateName" },
                { key: "issuingOrganization", icon: FaBuilding },
                { key: "issueDate", format: formatDate },
                { key: "credentialUrl", icon: FaLink, link: true },
              ],
              "No certificates added yet. Click 'Add' to get started."
            )}

            {/* ── Projects ── */}
            {renderEntitySection(
              "project", FaCode, "rose", "Projects",
              [
                { key: "title" },
                { key: "websiteLink", icon: FaLink, link: true },
                { key: "description", icon: FaInfoCircle },
              ],
              "No projects added yet. Click 'Add' to get started."
            )}

            {/* ── Resume ── */}
            <Section
              title="Resume"
              icon={FaFileAlt}
              color="orange"
              action={
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer">
                  <FaUpload size={10} />
                  {uploadingResume ? "Uploading..." : "Upload"}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                </label>
              }
            >
              {profile?.resumeUrl ? (
                <div className="flex items-center justify-between bg-orange-50 rounded-xl px-5 py-4 border border-orange-100">
                  <button
                    type="button"
                    onClick={handleResumeDownload}
                    disabled={downloadingResume}
                    className="flex items-center gap-3 group min-w-0 flex-1 text-left"
                  >
                    <FaFileAlt className="text-orange-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition">
                        {downloadingResume ? (
                          <><FaSpinner className="animate-spin inline mr-1.5" size={12} /> Downloading...</>
                        ) : (
                          <><FaDownload size={12} className="inline mr-1.5" /> Download Resume</>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {profile.resumePublicId ? (() => { const p = profile.resumePublicId; const idPart = p.substring(p.lastIndexOf('/') + 1); const idx = idPart.indexOf('_'); return idx >= 0 ? idPart.substring(idx + 1) : idPart; })() : 'Resume file'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleResumeDelete}
                    className="ml-3 p-2 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition shrink-0"
                    title="Delete resume"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <FaFileAlt className="text-gray-300 text-3xl mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No resume uploaded yet</p>
                  <p className="text-xs text-gray-400">Upload a PDF or DOC file (max 10MB)</p>
                </div>
              )}
            </Section>

            {/* ── Empty state ── */}
            {!personal.fullName && skillIds.length === 0 && experiences.length === 0 && educations.length === 0 && certificates.length === 0 && projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Your profile is empty.</p>
                <button onClick={() => navigate("/profile-setup")} className="bg-[#2557A7] text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition">
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Save ── */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2557A7] text-white font-medium hover:bg-blue-800 transition disabled:opacity-50 shadow-sm text-sm"
          >
            {saving ? (
              <><FaSpinner className="animate-spin" /> Saving All Changes...</>
            ) : (
              <><FaSave /> Save All Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
