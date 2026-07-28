import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaInfoCircle,
  FaSpinner,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaFileAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaCertificate,
  FaPlus,
  FaCheck,
} from "react-icons/fa";
import { updateCandidateProfile, uploadResume } from "../../services/CandidateService";
import { useToast } from "../../components/Toast";
import SkillPicker from "../../components/SkillPicker";

const STEPS = [
  { id: "personal", label: "Personal Info", icon: FaUser },
  { id: "experience", label: "Experience", icon: FaBriefcase },
  { id: "education", label: "Education", icon: FaGraduationCap },
  { id: "certificates", label: "Certificates", icon: FaCertificate },
  { id: "projects", label: "Projects", icon: FaCode },
  { id: "resume", label: "Resume", icon: FaFileAlt },
];

const CandidateProfileSetup = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Personal Info
  const [personal, setPersonal] = useState({
    fullName: "",
    phoneNo: "",
    address: "",
    githubLink: "",
    linkedInLink: "",
    portfolioLink: "",
    about: "",
  });

  const [skillIds, setSkillIds] = useState([]);

  // Step 2: Experience
  const [experiences, setExperiences] = useState([]);
  const [expForm, setExpForm] = useState({
    jobRole: "", jobType: "", companyName: "", location: "",
    startDate: "", endDate: "", currentlyWorking: false,
    description: "",
  });

  // Step 3: Education
  const [educations, setEducations] = useState([]);
  const [eduForm, setEduForm] = useState({
    institutionName: "", degree: "", fieldOfStudy: "",
    percentage: "", startDate: "", endDate: "", currentlyPursuing: false,
  });

  // Step 4: Certificates
  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm] = useState({
    certificateName: "", issuingOrganization: "",
    issueDate: "", credentialId: "", credentialUrl: "", description: "",
  });

  // Step 5: Projects
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({
    title: "", description: "", websiteLink: "", startDate: "", endDate: "", currentlyWorking: false,
  });

  // Step 6: Resume
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({});
  // 🟢 Track which steps have validation errors (for red step indicator & submit block)
  const [stepErrors, setStepErrors] = useState(new Set());

  // ---- Handlers ----

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonal((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };



  // ---- Entity form handlers ----

  const handleExpFormChange = (e) => {
    const { name, value } = e.target;
    setExpForm((prev) => ({ ...prev, [name]: value }));
  };

  const addExperience = () => {
    if (!expForm.jobRole.trim() || !expForm.companyName.trim()) {
      addToast("Job Role and Company Name are required.", "error");
      return;
    }
    const expData = { ...expForm };
    if (expData.currentlyWorking) expData.endDate = "";
    setExperiences((prev) => [...prev, expData]);
    setExpForm({ jobRole: "", jobType: "", companyName: "", location: "", startDate: "", endDate: "", currentlyWorking: false, description: "" });
  };

  const removeExperience = (idx) => setExperiences((prev) => prev.filter((_, i) => i !== idx));

  const handleEduFormChange = (e) => {
    const { name, value } = e.target;
    setEduForm((prev) => ({ ...prev, [name]: value }));
  };

  const addEducation = () => {
    if (!eduForm.institutionName.trim() || !eduForm.degree.trim()) {
      addToast("Institution Name and Degree are required.", "error");
      return;
    }
    const eduData = { ...eduForm };
    if (eduData.currentlyPursuing) eduData.endDate = "";
    setEducations((prev) => [...prev, eduData]);
    setEduForm({ institutionName: "", degree: "", fieldOfStudy: "", percentage: "", startDate: "", endDate: "", currentlyPursuing: false });
  };

  const removeEducation = (idx) => setEducations((prev) => prev.filter((_, i) => i !== idx));

  const handleCertFormChange = (e) => {
    const { name, value } = e.target;
    setCertForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCertificate = () => {
    if (!certForm.certificateName.trim()) {
      addToast("Certificate Name is required.", "error");
      return;
    }
    setCertificates((prev) => [...prev, { ...certForm }]);
    setCertForm({ certificateName: "", issuingOrganization: "", issueDate: "", credentialId: "", credentialUrl: "", description: "" });
  };

  const removeCertificate = (idx) => setCertificates((prev) => prev.filter((_, i) => i !== idx));

  const handleProjFormChange = (e) => {
    const { name, value } = e.target;
    setProjForm((prev) => ({ ...prev, [name]: value }));
  };

  const addProject = () => {
    if (!projForm.title.trim()) {
      addToast("Project Title is required.", "error");
      return;
    }
    const projData = { ...projForm };
    if (projData.currentlyWorking) projData.endDate = "";
    setProjects((prev) => [...prev, projData]);
    setProjForm({ title: "", description: "", websiteLink: "", startDate: "", endDate: "", currentlyWorking: false });
  };

  const removeProject = (idx) => setProjects((prev) => prev.filter((_, i) => i !== idx));

  // ---- Resume Upload ----

  const handleResumeSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { addToast("Please upload a PDF or DOC file.", "error"); return; }
    if (file.size > 10 * 1024 * 1024) { addToast("File size must be less than 10MB.", "error"); return; }

    setResumeFile(file);
    setUploading(true);
    try {
      const data = await uploadResume(file);
      if (data.url) {
        setResumeUrl(data.url);
        addToast("Resume uploaded!", "success");
      } else {
        throw new Error("Upload failed — no URL returned");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      addToast(err?.response?.data?.error || "Failed to upload resume.", "error");
      setResumeFile(null);
    } finally { setUploading(false); }
  };

  const removeResume = () => { setResumeFile(null); setResumeUrl(""); };

  // ---- Step Navigation & Validation ----

  const validatePersonal = () => {
    const errs = {};
    if (!personal.fullName.trim()) errs.fullName = "Full name is required";
    else if (personal.fullName.length > 100) errs.fullName = "Max 100 characters";
    if (skillIds.length === 0) errs.skills = "At least one skill is required";
    if (personal.githubLink && !/^https?:\/\/.+/.test(personal.githubLink)) errs.githubLink = "Invalid URL";
    if (personal.linkedInLink && !/^https?:\/\/.+/.test(personal.linkedInLink)) errs.linkedInLink = "Invalid URL";
    if (personal.portfolioLink && !/^https?:\/\/.+/.test(personal.portfolioLink)) errs.portfolioLink = "Invalid URL";
    return errs;
  };

  const handleContinue = () => {
    if (currentStep === 0) {
      const errs = validatePersonal();
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    setErrors({});
  };

  const handleSkip = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    setErrors({});
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
  };

  // ---- Full Validation (across all steps) ----
  // Returns an array of { step, errors } for all steps that have issues
  const validateAllSteps = () => {
    const results = [];

    // Step 0: Personal Info
    const personalErrs = validatePersonal();
    if (Object.keys(personalErrs).length > 0) {
      results.push({ step: 0, errors: personalErrs });
    }

    // Step 1: Experience — check if any item is missing jobRole or companyName
    const invalidExperiences = experiences.filter(
      (e) => !e.jobRole?.trim() || !e.companyName?.trim()
    );
    if (invalidExperiences.length > 0) {
      results.push({ step: 1, errors: { experience: `${invalidExperiences.length} experience item(s) have missing required fields` } });
    }

    // Step 2: Education — check if any education item is missing degree or institution
    const invalidEducations = educations.filter(
      (e) => !e.institutionName?.trim() || !e.degree?.trim()
    );
    if (invalidEducations.length > 0) {
      results.push({ step: 2, errors: { education: `${invalidEducations.length} education item(s) have missing required fields` } });
    }

    // Step 3: Certificates — check if any certificate is missing a name
    const invalidCertificates = certificates.filter((c) => !c.certificateName?.trim());
    if (invalidCertificates.length > 0) {
      results.push({ step: 3, errors: { certificate: `${invalidCertificates.length} certificate(s) are missing a name` } });
    }

    // Step 4: Projects — check if any project is missing a title
    const invalidProjects = projects.filter((p) => !p.title?.trim());
    if (invalidProjects.length > 0) {
      results.push({ step: 4, errors: { project: `${invalidProjects.length} project(s) are missing a title` } });
    }

    return results;
  };

  // ---- Final Submit ----

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const validationResults = validateAllSteps();
    const errorStepSet = new Set(validationResults.map((r) => r.step));
    setStepErrors(errorStepSet);

    if (validationResults.length > 0) {
      // Navigate to the first step with errors
      setCurrentStep(validationResults[0].step);
      setErrors(validationResults[0].errors);
      addToast(
        `Please fix errors in ${validationResults.length} step(s) before submitting.`,
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...personal,
        skillIds,
        resumeUrl,
        experiences,
        educations,
        certificates,
        projects,
      };
      await updateCandidateProfile(payload);
      localStorage.setItem("profileCompleted", "true");
      addToast("Profile saved successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      addToast("Failed to save profile.", "error");
    } finally { setSaving(false); }
  };

  // Derived flag: whether there are any step-level validation errors
  const hasStepErrors = stepErrors.size > 0;

  // ---- Render Helpers ----

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 px-4">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const hasError = stepErrors.has(idx);
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                hasError
                  ? "bg-red-500 text-white ring-2 ring-red-300 ring-offset-1"
                  : isActive
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : isDone
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              title={hasError ? `${step.label} has errors` : step.label}
            >
              {hasError ? (
                <span className="text-xs">!</span>
              ) : isDone ? (
                <FaCheck size={12} />
              ) : (
                <Icon size={14} />
              )}
            </div>
            <span className={`hidden sm:block text-xs font-medium ${
              hasError ? "text-red-600" : isActive ? "text-blue-700" : isDone ? "text-green-600" : "text-gray-400"
            }`}>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${hasError ? "bg-red-400" : idx < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderItemList = (items, removeFn, emptyMsg) => (
    <div className="space-y-2 mb-4">
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{emptyMsg}</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="min-w-0 flex-1">
              {Object.entries(item).map(([key, val]) =>
                typeof val !== "boolean" && val ? <span key={key} className="text-sm text-gray-700 mr-3"><span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span> {val}</span> : null
              )}
            </div>
            <button type="button" onClick={() => removeFn(idx)} className="text-red-400 hover:text-red-600 ml-3 shrink-0"><FaTimes /></button>
          </div>
        ))
      )}
    </div>
  );

  const StepActions = ({ onContinue, onSkip, continueLabel = "Continue", showBack = true }) => (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
      <div>
        {showBack && currentStep > 0 ? (
          <button type="button" onClick={handleBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">
            <FaArrowLeft size={12} /> Back
          </button>
        ) : <div />}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onSkip || handleSkip} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-500 font-medium hover:bg-gray-50 transition text-sm">
          Skip
        </button>
        <button type="button" onClick={onContinue || handleContinue} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2557A7] text-white font-medium hover:bg-blue-800 transition text-sm">
          {continueLabel} <FaArrowRight size={12} />
        </button>
      </div>
    </div>
  );

  // ---- Render Steps ----

  const renderPersonalStep = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FaUser className="text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500">Let us know a bit about yourself</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text" name="fullName" value={personal.fullName} onChange={handlePersonalChange}
              placeholder="John Doe" maxLength={100}
              className={`w-full border ${errors.fullName ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 h-10 outline-none transition text-sm`}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{personal.fullName.length}/100</p>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="text" name="phoneNo" value={personal.phoneNo} onChange={handlePersonalChange}
              placeholder="+1 555-1234" maxLength={20}
              className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input
              type="text" name="address" value={personal.address} onChange={handlePersonalChange}
              placeholder="123 Main St, City, Country" maxLength={255}
              className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">GitHub Link</label>
            <input
              type="url" name="githubLink" value={personal.githubLink} onChange={handlePersonalChange}
              placeholder="https://github.com/username"
              className={`w-full border ${errors.githubLink ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 h-10 outline-none transition text-sm`}
            />
            {errors.githubLink && <p className="text-xs text-red-500 mt-1">{errors.githubLink}</p>}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn Link</label>
            <input
              type="url" name="linkedInLink" value={personal.linkedInLink} onChange={handlePersonalChange}
              placeholder="https://linkedin.com/in/username"
              className={`w-full border ${errors.linkedInLink ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 h-10 outline-none transition text-sm`}
            />
            {errors.linkedInLink && <p className="text-xs text-red-500 mt-1">{errors.linkedInLink}</p>}
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Portfolio Link</label>
            <input
              type="url" name="portfolioLink" value={personal.portfolioLink} onChange={handlePersonalChange}
              placeholder="https://myportfolio.dev"
              className={`w-full border ${errors.portfolioLink ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 h-10 outline-none transition text-sm`}
            />
            {errors.portfolioLink && <p className="text-xs text-red-500 mt-1">{errors.portfolioLink}</p>}
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Skills <span className="text-red-500">*</span></label>
            <SkillPicker
              selectedIds={skillIds}
              onChange={setSkillIds}
              placeholder="Search and select skills from the database..."
            />
            {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
            <p className="text-xs text-gray-400 mt-1">Select skills from the database. Only admins can add new skills.</p>
          </div>

          {/* About */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">About Me</label>
            <textarea
              name="about" value={personal.about} onChange={handlePersonalChange}
              placeholder="Tell us a little about yourself, your background, and what you're looking for..."
              rows={3} maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <StepActions onContinue={handleContinue} onSkip={handleSkip} showBack={false} />
    </div>
  );

  const renderFormField = (f, formState) => {
    const isDisabled = f.disabled ? f.disabled(formState) : false;
    if (f.type === "select") {
      return (
        <select name={f.name} value={formState[f.name]} onChange={f.onChange} disabled={isDisabled} className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
          {f.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name={f.name} checked={formState[f.name]} onChange={(e) => {
            f.onChange({ target: { name: f.name, value: e.target.checked } });
          }} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
          <span className="text-sm text-gray-600">{f.label}</span>
        </label>
      );
    }
    if (f.textarea) {
      return (
        <textarea name={f.name} value={formState[f.name]} onChange={f.onChange} placeholder={f.placeholder} rows={2} disabled={isDisabled} maxLength={f.maxLength || 2000} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition text-sm resize-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
      );
    }
    return (
      <input type={f.type || "text"} name={f.name} value={formState[f.name]} onChange={f.onChange} placeholder={f.placeholder} disabled={isDisabled} maxLength={f.maxLength || 255} className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
    );
  };

  const renderEntityStep = (type, icon, colorClasses, items, form, formFields, addFn, removeFn, emptyMsg, formTitle) => {
    const Icon = icon;
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
              <Icon className={colorClasses.text} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{formTitle}</h2>
              <p className="text-sm text-gray-500">Add your {type}(s) below</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-5">
            <div className="grid md:grid-cols-2 gap-4">
              {formFields.map((f) => (
                <div key={f.name} className={f.fullWidth ? "md:col-span-2" : f.type === "checkbox" ? "md:col-span-2 flex items-center" : ""}>
                  {f.type !== "checkbox" && (
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {f.label}{f.required ? <span className="text-red-500"> *</span> : null}
                    </label>
                  )}
                  {renderFormField(f, form)}
                </div>
              ))}
            </div>
            <button type="button" onClick={addFn} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition">
              <FaPlus size={12} /> Add this {type}
            </button>
          </div>

          {/* Items List */}
          {renderItemList(items, removeFn, emptyMsg)}
        </div>
        <StepActions onContinue={handleContinue} onSkip={handleSkip} />
      </div>
    );
  };

  const renderResumeStep = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <FaFileAlt className="text-orange-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
          <p className="text-sm text-gray-500">Upload your resume (PDF, DOC — max 5MB)</p>
        </div>
      </div>

      {resumeUrl ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-600 text-lg" />
            <div>
              <p className="text-sm font-medium text-green-800">Resume uploaded</p>
              <p className="text-xs text-green-600 truncate max-w-[300px]">{resumeFile?.name || 'Resume file'}</p>
            </div>
          </div>
          <button type="button" onClick={removeResume} className="text-red-500 hover:text-red-700"><FaTimes /></button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition mb-6">
          <div className="text-center">
            {uploading ? <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-3" /> : <FaUpload className="text-gray-400 text-3xl mx-auto mb-3" />}
            <p className="text-sm font-medium text-gray-600">{uploading ? "Uploading..." : "Click to upload resume"}</p>
            <p className="text-xs text-gray-400 mt-1">PDF or DOC up to 5MB</p>
          </div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeSelect} className="hidden" disabled={uploading} />
        </label>
      )}



      {/* Error summary banner */}
      {hasStepErrors && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold text-red-600">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">
              Please fix the errors before submitting
            </p>
            <p className="text-xs text-red-600 mt-1">
              Steps with errors are marked in red above. Click on each step to fix the issues.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <button type="button" onClick={handleBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">
          <FaArrowLeft size={12} /> Back
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSkip} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-500 font-medium hover:bg-gray-50 transition text-sm">
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || hasStepErrors}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-white font-medium text-sm transition ${
              saving
                ? "bg-blue-300 cursor-not-allowed"
                : hasStepErrors
                ? "bg-red-400 cursor-not-allowed"
                : "bg-[#2557A7] hover:bg-blue-800"
            }`}
          >
            {saving ? (
              <><FaSpinner className="animate-spin" /> Saving...</>
            ) : hasStepErrors ? (
              <><span className="text-lg">!</span> Fix Errors First</>
            ) : (
              <><FaCheck /> Submit Profile</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ---- Main Render ----

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-blue-100 mt-1.5 text-sm sm:text-base">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <StepIndicator />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {currentStep === 0 && renderPersonalStep()}

          {currentStep === 1 && renderEntityStep(
            "experience", FaBriefcase,
            { bg: "bg-cyan-100", text: "text-cyan-700" },
            experiences, expForm,
            [
              { name: "jobRole", label: "Job Role", placeholder: "Software Engineer", required: true, maxLength: 100, onChange: handleExpFormChange },
              { name: "jobType", label: "Job Type", type: "select", options: [
                { value: "", label: "Select type" },
                { value: "FULL_TIME", label: "Full Time" },
                { value: "PART_TIME", label: "Part Time" },
                { value: "INTERNSHIP", label: "Internship" },
                { value: "CONTRACT", label: "Contract" },
              ], onChange: handleExpFormChange },
              { name: "companyName", label: "Company", placeholder: "Google", required: true, maxLength: 100, onChange: handleExpFormChange },
              { name: "location", label: "Location", placeholder: "Mountain View, CA", onChange: handleExpFormChange },
              { name: "startDate", label: "Start Date", type: "date", onChange: handleExpFormChange },
              { name: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyWorking, onChange: handleExpFormChange },
              { name: "currentlyWorking", label: "I currently work here", type: "checkbox", onChange: (e) => {
                const checked = e.target.value;
                setExpForm((prev) => ({ ...prev, currentlyWorking: checked, endDate: checked ? "" : prev.endDate }));
              }},
              { name: "description", label: "Description", placeholder: "Describe your role and achievements...", textarea: true, onChange: handleExpFormChange },
            ],
            addExperience, removeExperience,
            "No experience added yet. Add your work history.",
            "Experience"
          )}

          {currentStep === 2 && renderEntityStep(
            "education", FaGraduationCap,
            { bg: "bg-amber-100", text: "text-amber-700" },
            educations, eduForm,
            [
              { name: "institutionName", label: "Institution", placeholder: "Stanford University", required: true, onChange: handleEduFormChange },
              { name: "degree", label: "Degree", placeholder: "B.S. Computer Science", required: true, onChange: handleEduFormChange },
              { name: "fieldOfStudy", label: "Field of Study", placeholder: "Computer Science", onChange: handleEduFormChange },
              { name: "percentage", label: "Percentage / GPA", placeholder: "85% or 3.8", onChange: handleEduFormChange },
              { name: "startDate", label: "Start Date", type: "date", onChange: handleEduFormChange },
              { name: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyPursuing, onChange: handleEduFormChange },
              { name: "currentlyPursuing", label: "I am currently pursuing", type: "checkbox", onChange: (e) => {
                const checked = e.target.value;
                setEduForm((prev) => ({ ...prev, currentlyPursuing: checked, endDate: checked ? "" : prev.endDate }));
              }},
            ],
            addEducation, removeEducation,
            "No education added yet. Add your academic background.",
            "Education"
          )}

          {currentStep === 3 && renderEntityStep(
            "certificate", FaCertificate,
            { bg: "bg-emerald-100", text: "text-emerald-700" },
            certificates, certForm,
            [
              { name: "certificateName", label: "Certificate Name", placeholder: "AWS Solutions Architect", required: true, onChange: handleCertFormChange },
              { name: "issuingOrganization", label: "Organization", placeholder: "Amazon Web Services", onChange: handleCertFormChange },
              { name: "issueDate", label: "Issue Date", type: "date", onChange: handleCertFormChange },
              { name: "credentialId", label: "Credential ID", placeholder: "ABC123XYZ", onChange: handleCertFormChange },
              { name: "credentialUrl", label: "Credential URL", placeholder: "https://credential.com/verify/...", type: "url", onChange: handleCertFormChange },
              { name: "description", label: "Description", placeholder: "What skills did this certificate demonstrate?", textarea: true, onChange: handleCertFormChange },
            ],
            addCertificate, removeCertificate,
            "No certificates added yet. Add your certifications.",
            "Certificates"
          )}

          {currentStep === 4 && renderEntityStep(
            "project", FaCode,
            { bg: "bg-rose-100", text: "text-rose-700" },
            projects, projForm,
            [
              { name: "title", label: "Project Title", placeholder: "E-Commerce Platform", required: true, onChange: handleProjFormChange },
              { name: "description", label: "Description", placeholder: "Describe your project, tech stack, and impact...", textarea: true, onChange: handleProjFormChange },
              { name: "websiteLink", label: "Website / Demo URL", placeholder: "https://myproject.com", type: "url", onChange: handleProjFormChange },
              { name: "startDate", label: "Start Date", type: "date", onChange: handleProjFormChange },
              { name: "endDate", label: "End Date", type: "date", disabled: (form) => form.currentlyWorking, onChange: handleProjFormChange },
              { name: "currentlyWorking", label: "I am currently working on this", type: "checkbox", onChange: (e) => {
                const checked = e.target.value;
                setProjForm((prev) => ({ ...prev, currentlyWorking: checked, endDate: checked ? "" : prev.endDate }));
              }},
            ],
            addProject, removeProject,
            "No projects added yet. Add your projects.",
            "Projects"
          )}

          {currentStep === 5 && renderResumeStep()}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileSetup;
