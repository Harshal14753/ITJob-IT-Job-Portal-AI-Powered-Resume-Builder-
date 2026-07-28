import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUpload,
    FaSpinner,
    FaCheckCircle,
    FaTimes,
    FaArrowLeft,
    FaArrowRight,
    FaUser,
    FaBriefcase,
    FaGraduationCap,
    FaCertificate,
    FaCode,
    FaMagic,
    FaCheck,
    FaPlus,
    FaExclamationTriangle,
    FaLightbulb,
    FaTag,
} from "react-icons/fa";
import { useToast } from "../../components/Toast";
import { updateCandidateProfile } from "../../services/CandidateService";
import SkillPicker from "../../components/SkillPicker";
import http from "../../config/AxiosHelper";
import { getAllSkills } from "../../services/JobService";

const STEPS = [
    { id: "upload", label: "Upload Resume", icon: FaUpload },
    { id: "review", label: "Review & Edit", icon: FaMagic },
];

const AIProfileSetup = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [step, setStep] = useState(0);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [parsed, setParsed] = useState(false);
    const [parseError, setParseError] = useState("");

    // Profile data from AI
    const [profile, setProfile] = useState({
        fullName: "",
        phoneNo: "",
        address: "",
        githubLink: "",
        linkedInLink: "",
        portfolioLink: "",
        about: "",
        skills: [],
        experiences: [],
        educations: [],
        certificates: [],
        projects: [],
    });

    // 🟢 Skill IDs for the SkillPicker (matched from AI-detected skill names)
    const [skillIds, setSkillIds] = useState([]);
    // 🟢 Skill names that were detected by AI but not found in the database
    const [unmatchedSkills, setUnmatchedSkills] = useState([]);
    // 🟢 Loading state while mapping AI skills to database IDs
    const [skillMappingLoading, setSkillMappingLoading] = useState(false);
    // ⚠️ [PREVIOUS] const [allSkills, setAllSkills] = useState([]); — replaced by mapping logic below

    // 🟢 Generation counter to cancel stale in-flight skill mappings (handles re-upload race conditions)
    // Each call to mapAISkillsToDbSkills increments this. When the async call completes,
    // it checks if its generation is still current — if not, it bails out (stale update).
    const mappingGenRef = useRef(0);
    useEffect(() => {
        // On unmount, increment so any in-flight mapping sees a gen mismatch and bails
        return () => { mappingGenRef.current++; };
    }, []);

    // Handle file selection and upload to backend for AI parsing
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const fileName = file.name.toLowerCase();
        const isAllowedType =
            allowed.includes(file.type) ||
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".doc") ||
            fileName.endsWith(".docx");

        if (!isAllowedType) {
            addToast("Please upload a PDF or DOC file.", "error");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            addToast("File size must be less than 10MB.", "error");
            return;
        }

        setResumeFile(file);
        setParseError("");
        await parseResume(file);
    };

    const parseResume = async (file) => {
        setParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await http.post("/ai/parse-resume", formData, {
                timeout: 60000, // 60s timeout for AI processing
            });

            const data = response.data;
            setProfile({
                fullName: data.fullName || "",
                phoneNo: data.phoneNo || "",
                address: data.address || "",
                githubLink: data.githubLink || "",
                linkedInLink: data.linkedInLink || "",
                portfolioLink: data.portfolioLink || "",
                about: data.about || "",
                skills: data.skills || [],
                experiences: data.experiences || [],
                educations: data.educations || [],
                certificates: data.certificates || [],
                projects: data.projects || [],
            });
            setParsed(true);
            setStep(1); // Move to review step
            addToast("Resume parsed successfully! Review the details below.", "success");

            // ── Auto-map AI-detected skill names → database skill IDs ──
            mapAISkillsToDbSkills(data.skills || []);
        } catch (error) {
            console.error("Parse error:", error);
            setParseError(
                error.response?.data ||
                "Failed to parse resume. The AI service may not be configured. Please try manual setup."
            );
            addToast("Failed to parse resume.", "error");
        } finally {
            setParsing(false);
        }
    };

    // ── AI Skills → Database Skill IDs Mapping ──
    //
    // Why this approach (frontend-only) vs backend mapping in AIServiceImpl:
    //   1. Single Responsibility: AIServiceImpl should ONLY handle AI parsing, not DB lookups.
    //   2. Separation of Concerns: Mapping strings → IDs is a UI concern (what to pre-select).
    //   3. Zero backend coupling: No need to inject SkillsRepo into the AI service.
    //   4. Reusable: Users can see which skills were/were not matched and adjust manually.
    //   5. Performance: All skills are already cached in the browser; this is an O(n) in-memory operation.
    //
    const mapAISkillsToDbSkills = async (aiSkillNames) => {
        // Record this call's generation — if a newer call starts (or component unmounts),
        // the ref increments, and this call will bail out (avoids stale state updates)
        const myGen = ++mappingGenRef.current;

        setSkillMappingLoading(true);
        try {
            // Fetch all skills from the database (case-insensitive name matching)
            const dbSkills = await getAllSkills();
            if (myGen !== mappingGenRef.current) return; // Bail if stale

            const matchedIds = [];
            const unmatched = [];
            const seenIds = new Set(); // Dedup tracker (Set for O(1) lookup)

            // Strip duplicates from AI output first (Gemini sometimes returns "Java", "Java")
            const uniqueAiSkills = [];
            const aiSkillSet = new Set();
            aiSkillNames.forEach((s) => {
                if (s && s.trim()) {
                    const lower = s.trim().toLowerCase();
                    if (!aiSkillSet.has(lower)) {
                        aiSkillSet.add(lower);
                        uniqueAiSkills.push(s.trim());
                    }
                }
            });

            // Build a case-insensitive lookup map from DB skills for O(1) matching
            // { "java" → { id: 1, skill: "Java" }, "spring boot" → { id: 2, skill: "Spring Boot" }, ... }
            const skillLookup = new Map();
            dbSkills.forEach((dbSkill) => {
                if (dbSkill.skill) {
                    skillLookup.set(dbSkill.skill.toLowerCase(), dbSkill);
                }
            });

            // Match each unique AI skill name against the DB (case-insensitive exact match only)
            uniqueAiSkills.forEach((aiSkill) => {
                const dbSkill = skillLookup.get(aiSkill.toLowerCase());
                if (dbSkill && !seenIds.has(dbSkill.id)) {
                    seenIds.add(dbSkill.id);
                    matchedIds.push(dbSkill.id);
                } else if (!dbSkill) {
                    unmatched.push(aiSkill);
                }
            });

            if (myGen !== mappingGenRef.current) return; // Bail if stale (before state updates)

            setSkillIds(matchedIds);
            setUnmatchedSkills(unmatched);

            // Show user-friendly toasts
            if (matchedIds.length > 0) {
                addToast(
                    `✅ Auto-selected ${matchedIds.length} skill(s) from your resume!`,
                    "success"
                );
            }
            if (unmatched.length > 0) {
                addToast(
                    `⚠️ ${unmatched.length} skill(s) from your resume were not found in the database.`,
                    "info"
                );
            }
        } catch (err) {
            if (myGen !== mappingGenRef.current) return; // Bail if stale
            console.error("Failed to map AI skills to database skills:", err);
            addToast(
                "⚠️ Could not auto-select skills. Please select them manually.",
                "info"
            );
        } finally {
            if (myGen === mappingGenRef.current) {
                setSkillMappingLoading(false);
            }
        }
    };

    // Profile field handlers
    const handleFieldChange = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    // Experience handlers
    const [expForm, setExpForm] = useState({
        jobRole: "", jobType: "", companyName: "", location: "",
        startDate: "", endDate: "", currentlyWorking: false, description: "",
    });
    const addExperience = () => {
        if (!expForm.jobRole.trim() || !expForm.companyName.trim()) {
            addToast("Job Role and Company Name are required.", "error");
            return;
        }
        const data = { ...expForm };
        if (data.currentlyWorking) data.endDate = "";
        setProfile((prev) => ({ ...prev, experiences: [...prev.experiences, data] }));
        setExpForm({ jobRole: "", jobType: "", companyName: "", location: "", startDate: "", endDate: "", currentlyWorking: false, description: "" });
    };
    const removeExperience = (idx) => setProfile((prev) => ({
        ...prev, experiences: prev.experiences.filter((_, i) => i !== idx),
    }));

    // Education handlers
    const [eduForm, setEduForm] = useState({
        institutionName: "", degree: "", fieldOfStudy: "",
        percentage: "", startDate: "", endDate: "", currentlyPursuing: false,
    });
    const addEducation = () => {
        if (!eduForm.institutionName.trim() || !eduForm.degree.trim()) {
            addToast("Institution Name and Degree are required.", "error");
            return;
        }
        const data = { ...eduForm };
        if (data.currentlyPursuing) data.endDate = "";
        setProfile((prev) => ({ ...prev, educations: [...prev.educations, data] }));
        setEduForm({ institutionName: "", degree: "", fieldOfStudy: "", percentage: "", startDate: "", endDate: "", currentlyPursuing: false });
    };
    const removeEducation = (idx) => setProfile((prev) => ({
        ...prev, educations: prev.educations.filter((_, i) => i !== idx),
    }));

    // Certificate handlers
    const [certForm, setCertForm] = useState({
        certificateName: "", issuingOrganization: "", issueDate: "",
        credentialId: "", credentialUrl: "", description: "",
    });
    const addCertificate = () => {
        if (!certForm.certificateName.trim()) {
            addToast("Certificate Name is required.", "error");
            return;
        }
        setProfile((prev) => ({ ...prev, certificates: [...prev.certificates, { ...certForm }] }));
        setCertForm({ certificateName: "", issuingOrganization: "", issueDate: "", credentialId: "", credentialUrl: "", description: "" });
    };
    const removeCertificate = (idx) => setProfile((prev) => ({
        ...prev, certificates: prev.certificates.filter((_, i) => i !== idx),
    }));

    // Project handlers
    const [projForm, setProjForm] = useState({
        title: "", description: "", websiteLink: "",
        startDate: "", endDate: "", currentlyWorking: false,
    });
    const addProject = () => {
        if (!projForm.title.trim()) {
            addToast("Project Title is required.", "error");
            return;
        }
        const data = { ...projForm };
        if (data.currentlyWorking) data.endDate = "";
        setProfile((prev) => ({ ...prev, projects: [...prev.projects, data] }));
        setProjForm({ title: "", description: "", websiteLink: "", startDate: "", endDate: "", currentlyWorking: false });
    };
    const removeProject = (idx) => setProfile((prev) => ({
        ...prev, projects: prev.projects.filter((_, i) => i !== idx),
    }));

    // Final submit
    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                fullName: profile.fullName,
                phoneNo: profile.phoneNo,
                address: profile.address,
                githubLink: profile.githubLink,
                linkedInLink: profile.linkedInLink,
                portfolioLink: profile.portfolioLink,
                about: profile.about,
                skillIds,
                experiences: profile.experiences,
                educations: profile.educations,
                certificates: profile.certificates,
                projects: profile.projects,
            };
            await updateCandidateProfile(payload);
            localStorage.setItem("profileCompleted", "true");
            addToast("Profile saved successfully!", "success");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
            addToast("Failed to save profile.", "error");
        } finally {
            setSaving(false);
        }
    };

    // Render list of items (experiences, educations, etc.)
    const renderItemList = (items, removeFn, emptyMsg) => (
        <div className="space-y-2 mb-4">
            {items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">{emptyMsg}</p>
            ) : (
                items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className="min-w-0 flex-1 text-sm text-gray-700">
                            {item.jobRole && <span className="font-medium">{item.jobRole}</span>}
                            {item.companyName && <span className="text-gray-500"> at {item.companyName}</span>}
                            {item.degree && <span className="font-medium">{item.degree}</span>}
                            {item.institutionName && <span className="text-gray-500"> - {item.institutionName}</span>}
                            {item.certificateName && <span className="font-medium">{item.certificateName}</span>}
                            {item.title && <span className="font-medium">{item.title}</span>}
                        </div>
                        <button type="button" onClick={() => removeFn(idx)} className="text-red-400 hover:text-red-600 ml-3 shrink-0">
                            <FaTimes />
                        </button>
                    </div>
                ))
            )}
        </div>
    );

    // ======= RENDER: Upload Step =======
    const renderUploadStep = () => (
        <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
                <FaMagic className="text-purple-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                Upload your resume and our AI will automatically extract your details.
                You can review and edit everything before saving.
            </p>

            {parsing ? (
                <div className="flex flex-col items-center gap-4 py-12">
                    <FaSpinner className="animate-spin text-purple-600 text-4xl" />
                    <p className="text-gray-600 font-medium">AI is analyzing your resume...</p>
                    <p className="text-gray-400 text-sm">This may take a few seconds</p>
                </div>
            ) : resumeFile && parsed ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 max-w-md mx-auto">
                    <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-800">Resume Parsed!</h3>
                    <p className="text-sm text-green-600 mt-1">{resumeFile.name}</p>
                    <p className="text-xs text-green-500 mt-1">
                        {profile.skills.length} skills · {profile.experiences.length} experiences ·{" "}
                        {profile.educations.length} educations extracted
                    </p>
                    <button
                        onClick={() => setStep(1)}
                        className="mt-6 px-8 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                    >
                        Review & Edit <FaArrowRight />
                    </button>
                </div>
            ) : parseError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                    <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-red-800">Parsing Failed</h3>
                    <p className="text-sm text-red-600 mt-2">{parseError}</p>
                    <div className="flex gap-3 mt-6 justify-center">
                        <button
                            onClick={() => { setResumeFile(null); setParseError(""); }}
                            className="px-6 py-2.5 rounded-xl border border-red-300 text-red-700 font-medium hover:bg-red-50 transition text-sm"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate("/profile-setup")}
                            className="px-6 py-2.5 rounded-xl bg-gray-600 text-white font-medium hover:bg-gray-700 transition text-sm"
                        >
                            Go to Manual Setup
                        </button>
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl py-16 px-8 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition max-w-lg mx-auto">
                    <FaUpload className="text-gray-400 text-4xl mb-4" />
                    <p className="text-lg font-medium text-gray-600">Click to upload your resume</p>
                    <p className="text-sm text-gray-400 mt-2">PDF, DOC, or DOCX — Max 10MB</p>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={parsing}
                    />
                </label>
            )}

            <div className="mt-8">
                <button
                    onClick={() => navigate("/profile-setup")}
                    className="text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2"
                >
                    Prefer manual setup? Click here
                </button>
            </div>
        </div>
    );

    // ======= RENDER: Review & Edit Step =======
    const renderReviewStep = () => (
        <div>
            {/* Personal Info Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FaUser className="text-blue-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                        <input type="text" value={profile.fullName}
                            onChange={(e) => handleFieldChange("fullName", e.target.value)}
                            maxLength={100}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                        <input type="text" value={profile.phoneNo}
                            onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                            maxLength={20}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <input type="text" value={profile.address}
                            onChange={(e) => handleFieldChange("address", e.target.value)}
                            maxLength={255}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">GitHub Link</label>
                        <input type="url" value={profile.githubLink}
                            onChange={(e) => handleFieldChange("githubLink", e.target.value)}
                            maxLength={255}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn Link</label>
                        <input type="url" value={profile.linkedInLink}
                            onChange={(e) => handleFieldChange("linkedInLink", e.target.value)}
                            maxLength={255}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Portfolio Link</label>
                        <input type="url" value={profile.portfolioLink}
                            onChange={(e) => handleFieldChange("portfolioLink", e.target.value)}
                            maxLength={255}
                            className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none transition text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Skills</label>
                        <SkillPicker selectedIds={skillIds} onChange={setSkillIds}
                            placeholder="Search and select skills from the database..." />
                        
                        {/* Mapping status indicators */}
                        {skillMappingLoading && (
                            <div className="flex items-center gap-2 mt-2">
                                <FaSpinner className="animate-spin text-purple-500 text-xs" />
                                <span className="text-xs text-purple-600">Mapping AI-detected skills to database...</span>
                            </div>
                        )}

                        {!skillMappingLoading && profile.skills.length > 0 && (
                            <div className="mt-2">
                                {/* Matched skills summary */}
                                {skillIds.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                        <FaTag className="text-green-500 text-xs" />
                                        <span className="text-xs font-medium text-green-700">
                                            Auto-selected ({skillIds.length}):
                                        </span>
                                        {/* We can't show the names here easily without re-fetching, 
                                            but SkillPicker shows the selected tags below */}
                                    </div>
                                )}

                                {/* Unmatched skills warning */}
                                {unmatchedSkills.length > 0 && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <FaLightbulb className="text-amber-600 text-xs" />
                                            <span className="text-xs font-medium text-amber-800">
                                                Skills not found in database ({unmatchedSkills.length}):
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {unmatchedSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-medium"
                                                >
                                                    <FaTag size={8} />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-amber-600 mt-2">
                                            Ask your admin to add these skills to the database, or search & select manually from the dropdown above.
                                        </p>
                                    </div>
                                )}

                                {/* All matched (using unique count — AI may return duplicates like "Java", "Java") */}
                                {unmatchedSkills.length === 0 && skillIds.length > 0 && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <FaCheck size={10} />
                                        All {skillIds.length} unique AI-detected skill(s) matched to database entries!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Show raw AI-found skills as reference */}
                        {!skillMappingLoading && profile.skills.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1.5">
                                <span className="text-purple-600 font-medium">AI detected: </span>
                                {profile.skills.slice(0, 10).join(", ")}
                                {profile.skills.length > 10 ? "..." : ""}
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">About Me</label>
                        <textarea rows={3} value={profile.about}
                            onChange={(e) => handleFieldChange("about", e.target.value)}
                            maxLength={500}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition text-sm resize-none" />
                    </div>
                </div>
            </div>

            {/* Experience Section */}
            <div className="mb-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                        <FaBriefcase className="text-cyan-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                </div>
                {renderItemList(profile.experiences, removeExperience, "No experience found in resume.")}
                {/* Add experience form */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Job Role" value={expForm.jobRole}
                            onChange={(e) => setExpForm((p) => ({ ...p, jobRole: e.target.value }))}
                            maxLength={100}
                            className="border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                        <input type="text" placeholder="Company Name" value={expForm.companyName}
                            onChange={(e) => setExpForm((p) => ({ ...p, companyName: e.target.value }))}
                            maxLength={100}
                            className="border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                    </div>
                    <button type="button" onClick={addExperience}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                        <FaPlus size={12} /> Add missing experience
                    </button>
                </div>
            </div>

            {/* Education Section */}
            <div className="mb-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <FaGraduationCap className="text-amber-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                </div>
                {renderItemList(profile.educations, removeEducation, "No education found in resume.")}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Institution" value={eduForm.institutionName}
                            onChange={(e) => setEduForm((p) => ({ ...p, institutionName: e.target.value }))}
                            maxLength={100}
                            className="border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                        <input type="text" placeholder="Degree" value={eduForm.degree}
                            onChange={(e) => setEduForm((p) => ({ ...p, degree: e.target.value }))}
                            maxLength={100}
                            className="border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                    </div>
                    <button type="button" onClick={addEducation}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                        <FaPlus size={12} /> Add missing education
                    </button>
                </div>
            </div>

            {/* Certificates Section */}
            <div className="mb-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FaCertificate className="text-emerald-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Certificates</h2>
                </div>
                {renderItemList(profile.certificates, removeCertificate, "No certificates found in resume.")}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <input type="text" placeholder="Certificate Name" value={certForm.certificateName}
                        onChange={(e) => setCertForm((p) => ({ ...p, certificateName: e.target.value }))}
                        maxLength={255}
                        className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                    <button type="button" onClick={addCertificate}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                        <FaPlus size={12} /> Add missing certificate
                    </button>
                </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                        <FaCode className="text-rose-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                </div>
                {renderItemList(profile.projects, removeProject, "No projects found in resume.")}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <input type="text" placeholder="Project Title" value={projForm.title}
                        onChange={(e) => setProjForm((p) => ({ ...p, title: e.target.value }))}
                        maxLength={100}
                        className="w-full border border-gray-300 rounded-lg px-3 h-10 outline-none text-sm" />
                    <button type="button" onClick={addProject}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                        <FaPlus size={12} /> Add missing project
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <button onClick={() => setStep(0)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">
                    <FaArrowLeft size={12} /> Back to Upload
                </button>
                <button onClick={handleSubmit} disabled={saving}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-white font-medium text-sm transition ${
                        saving ? "bg-blue-300 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
                    }`}>
                    {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaCheck /> Save Profile</>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">AI-Powered Profile Setup</h1>
                    <p className="text-purple-100 mt-1.5 text-sm sm:text-base">
                        Step {step + 1} of {STEPS.length}: {STEPS[step].label}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = idx === step;
                        const isDone = idx < step;
                        return (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                                    isActive ? "bg-purple-600 text-white shadow-lg scale-110" :
                                    isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                                }`}>
                                    {isDone ? <FaCheck size={12} /> : <Icon size={14} />}
                                </div>
                                <span className={`hidden sm:block text-xs font-medium ${isActive ? "text-purple-700" : isDone ? "text-green-600" : "text-gray-400"}`}>
                                    {s.label}
                                </span>
                                {idx < STEPS.length - 1 && (
                                    <div className={`w-6 sm:w-10 h-0.5 ${idx < step ? "bg-green-500" : "bg-gray-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    {step === 0 && renderUploadStep()}
                    {step === 1 && renderReviewStep()}
                </div>
            </div>
        </div>
    );
};

export default AIProfileSetup;
