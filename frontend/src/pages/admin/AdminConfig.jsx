import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaCog,
    FaSpinner,
    FaSave,
    FaGlobe,
    FaShieldAlt,
    FaEnvelope,
    FaCloudUploadAlt,
    FaBriefcase,
    FaUserGraduate,
    FaUserTie,
    FaStar,
    FaEye,
    FaEyeSlash,
    FaPaperPlane,
    FaLock,
    FaRobot,
} from "react-icons/fa";
import http from "../../config/AxiosHelper";
import { useToast } from "../../components/Toast";
import { SiteConfigContext } from "../../context/SiteConfigContext";

const apiFetchConfigs = async () => {
    const response = await http.get("/admin/config");
    return response.data;
};

const apiUpdateConfig = async (configId, data) => {
    const response = await http.put(`/admin/config/${configId}`, data);
    return response.data;
};

const CATEGORIES = [
    {
        key: "General",
        icon: <FaGlobe />,
        color: "from-blue-500 to-cyan-600",
        rating: 5,
        description: "Basic site information and branding",
    },
    {
        key: "Auth & Security",
        icon: <FaShieldAlt />,
        color: "from-purple-500 to-pink-600",
        rating: 5,
        description: "Authentication, tokens, and security policies",
    },
    {
        key: "SMTP",
        icon: <FaEnvelope />,
        color: "from-green-500 to-emerald-600",
        rating: 5,
        description: "Email server configuration for sending emails",
    },
    {
        key: "Cloud Storage",
        icon: <FaCloudUploadAlt />,
        color: "from-orange-500 to-red-600",
        rating: 4,
        description: "Cloudinary and file storage settings",
    },
    {
        key: "Job Settings",
        icon: <FaBriefcase />,
        color: "from-indigo-500 to-purple-600",
        rating: 5,
        description: "Job posting rules and expiration policies",
    },
    {
        key: "Candidate Settings",
        icon: <FaUserGraduate />,
        color: "from-teal-500 to-green-600",
        rating: 3,
        description: "Candidate profile and resume settings",
    },        {
            key: "Recruiter Settings",
            icon: <FaUserTie />,
            color: "from-amber-500 to-orange-600",
            rating: 3,
            description: "Recruiter verification and job limits",
        },
        {
            key: "AI Settings",
            icon: <FaRobot />,
            color: "from-fuchsia-500 to-purple-600",
            rating: 4,
            description: "AI-powered features: auto-apply, matching, and recommendations",
        },
    ];

const RatingStars = ({ count }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
                key={star}
                className={`text-xs ${
                    star <= count ? "text-yellow-400" : "text-slate-600"
                }`}
            />
        ))}
    </div>
);

const AdminConfig = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { refreshConfigs } = useContext(SiteConfigContext);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [activeCategory, setActiveCategory] = useState("General");
    const [testingEmail, setTestingEmail] = useState(false);
    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await apiFetchConfigs();
            setConfigs(data);
            const values = {};
            data.forEach((c) => {
                values[c.id] = c.configValue;
            });
            setEditValues(values);
        } catch (error) {
            console.error("Error fetching config:", error);
            addToast("Failed to load configuration.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (configId) => {
        setSaving(configId);
        try {
            await apiUpdateConfig(configId, {
                configValue: editValues[configId],
            });
            addToast("Configuration updated.", "success");
            // Refresh public configs so website updates immediately
            refreshConfigs();
        } catch (error) {
            console.error("Error updating config:", error);
            addToast("Failed to update configuration.", "error");
        } finally {
            setSaving(null);
        }
    };

    const handleTestEmail = async () => {
        setTestingEmail(true);
        try {
            // Get the sender email from editValues (unsaved changes included)
            const smtpConfig = configs.find(c => c.configKey === "smtp_sender_email");
            const toEmail = smtpConfig ? (editValues[smtpConfig.id] || smtpConfig.configValue) : "";
            await http.post("/admin/test-email", { email: toEmail });
            addToast("Test email sent successfully!", "success");
        } catch (error) {
            const msg = error.response?.data || "Failed to send test email.";
            addToast(msg, "error");
        } finally {
            setTestingEmail(false);
        }
    };

    const togglePassword = (configId) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [configId]: !prev[configId],
        }));
    };

    // Filter out removed config keys
    // Config keys that are managed via application.properties / environment variables
    // (passwords, secrets, API keys should NOT be stored in the database)
    const EXCLUDED_KEYS = [
        "general_website_logo",
        "general_favicon",
        "general_default_language",
        "auth_password_policy",
        "auth_enable_email_verification",
        "auth_enable_two_factor",
        // Secrets managed via application-dev.properties:
        "smtp_password",
        "cloudinary_cloud_name",
        "cloudinary_api_key",
        "cloudinary_api_secret",
    ];

    // Environment-managed keys (shown as read-only info cards)
    const ENV_MANAGED_KEYS = [
        { configKey: "smtp_password", label: "SMTP Password", group: "SMTP", envVar: "SMTP_PASSWORD", propKey: "app.smtp.password" },
        { configKey: "cloudinary_cloud_name", label: "Cloudinary Cloud Name", group: "Cloud Storage", envVar: "CLOUDINARY_CLOUD_NAME", propKey: "app.cloudinary.cloud-name" },
        { configKey: "cloudinary_api_key", label: "Cloudinary API Key", group: "Cloud Storage", envVar: "CLOUDINARY_API_KEY", propKey: "app.cloudinary.api-key" },
        { configKey: "cloudinary_api_secret", label: "Cloudinary API Secret", group: "Cloud Storage", envVar: "CLOUDINARY_API_SECRET", propKey: "app.cloudinary.api-secret" },
    ];
    const filteredConfigs = configs.filter((c) => !EXCLUDED_KEYS.includes(c.configKey));

    const groupedConfigs = {};
    filteredConfigs.forEach((config) => {
        const group = config.groupName || "General";
        if (!groupedConfigs[group]) groupedConfigs[group] = [];
        groupedConfigs[group].push(config);
    });

    const renderInput = (config) => {
        const type = config.inputType || "text";
        const value = editValues[config.id] || "";
        const isPassword = type === "password";
        const isVisible = visiblePasswords[config.id];

        const handleChange = (newValue) => {
            setEditValues({ ...editValues, [config.id]: newValue });
        };

        if (type === "toggle") {
            const isOn = value === "true";
            return (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleChange(isOn ? "false" : "true")}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                            isOn ? "bg-green-500" : "bg-slate-600"
                        }`}
                    >
                        <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                isOn ? "translate-x-6" : "translate-x-0.5"
                            }`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${isOn ? "text-green-400" : "text-slate-400"}`}>
                        {isOn ? "Enabled" : "Disabled"}
                    </span>
                </div>
            );
        }

        if (type === "select") {
            return (
                <select
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                    {config.configKey.includes("language") && (
                        <>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="mr">Marathi</option>
                            <option value="gu">Gujarati</option>
                        </>
                    )}
                    {config.configKey.includes("password_policy") && (
                        <>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </>
                    )}
                    {config.configKey.includes("resume_visibility") && (
                        <>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="contacts_only">Contacts Only</option>
                        </>
                    )}
                    {!config.configKey.includes("language") &&
                        !config.configKey.includes("password_policy") &&
                        !config.configKey.includes("resume_visibility") && (
                            <>
                                <option value={value}>{value}</option>
                            </>
                        )}
                </select>
            );
        }

        if (isPassword) {
            return (
                <div className="relative">
                    <input
                        type={isVisible ? "text" : "password"}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                        placeholder="Enter value..."
                    />
                    <button
                        type="button"
                        onClick={() => togglePassword(config.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                        {isVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            );
        }

        if (type === "number") {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            );
        }

        return (
            <input
                type={type === "email" ? "email" : "text"}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter value..."
            />
        );
    };

    const getCategoryInfo = (groupName) => {
        return (
            CATEGORIES.find((c) => c.key === groupName) || {
                icon: <FaCog />,
                color: "from-slate-500 to-slate-600",
                rating: 3,
                description: "",
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 border-b border-slate-600">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 text-blue-300 hover:text-white transition mb-4"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                            <FaCog className="text-2xl text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">System Configuration</h1>
                            <p className="text-blue-300 mt-1">
                                Manage all application settings across {CATEGORIES.length} categories
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-slate-700 bg-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
                    <div className="flex gap-1 py-3 min-w-max">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                    activeCategory === cat.key
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : "text-slate-400 hover:text-white hover:bg-slate-700"
                                }`}
                            >
                                <span className="text-xs">{cat.icon}</span>
                                {cat.key}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-400 text-4xl" />
                    </div>
                ) : (
                    Object.entries(groupedConfigs)
                        .filter(([group]) => group === activeCategory)
                        .map(([group, groupConfigs]) => {
                            const catInfo = getCategoryInfo(group);
                            return (
                                <div key={group}>
                                    {/* Category Header */}
                                    <div
                                        className={`bg-gradient-to-r ${catInfo.color} rounded-2xl p-6 mb-6 shadow-lg`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl text-white">
                                                    {catInfo.icon}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">{group}</h2>
                                                    <p className="text-white/80 text-sm mt-1">
                                                        {catInfo.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <RatingStars count={catInfo.rating} />
                                        </div>
                                    </div>

                                    {/* Config Cards */}
                                    <div className="space-y-4">
                                        {groupConfigs.map((config) => {
                                            const LABEL_SUFFIXES = {
                                                auth_jwt_access_expiry: "hours",
                                                auth_jwt_refresh_expiry: "days",
                                                auth_otp_expiry_time: "minutes",
                                                auth_max_login_attempts: "attempts",
                                            };
                                            const displayLabel = config.configKey
                                                .replace(/^(general|auth|smtp|cloudinary|storage|job|db|candidate|recruiter)_/, "")
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l) => l.toUpperCase());
                                            const suffix = LABEL_SUFFIXES[config.configKey];

                                            return (
                                                <div
                                                    key={config.id}
                                                    className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-600 transition p-6"
                                                >
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <label className="font-semibold text-white">
                                                                    {displayLabel}
                                                                </label>
                                                                {suffix && (
                                                                    <span className="text-xs text-slate-400 font-medium bg-slate-700/50 px-2 py-0.5 rounded">
                                                                        {suffix}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-slate-500 font-mono bg-slate-700/50 px-2 py-0.5 rounded">
                                                                    {config.configKey}
                                                                </span>
                                                            </div>
                                                            {config.description && (
                                                                <p className="text-sm text-slate-400 mb-4">
                                                                    {config.description}
                                                                </p>
                                                            )}
                                                            {renderInput(config)}
                                                        </div>
                                                        <button
                                                            onClick={() => handleSave(config.id)}
                                                            disabled={saving === config.id}
                                                            className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 shrink-0 mt-8"
                                                        >
                                                            {saving === config.id ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaSave />
                                                            )}
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Environment-managed config info cards */}
                                        {ENV_MANAGED_KEYS.filter((ek) => ek.group === group).map((ek) => (
                                            <div
                                                key={ek.configKey}
                                                className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                            <FaLock className="text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <label className="font-semibold text-white">{ek.label}</label>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                                                                    <FaLock className="text-[10px]" />
                                                                    Managed via Environment
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-400 mb-2">
                                                                Configured through <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">{ek.propKey}</code>{" "}
                                                                in <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">application-dev.properties</code>
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Override via{" "}
                                                                <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-blue-300">{ek.envVar}</code>{" "}
                                                                environment variable
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Test Email Button - Only show in SMTP section */}
                                        {group === "SMTP" && (
                                            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                            <FaPaperPlane className="text-green-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-white">Test Email Configuration</h3>
                                                            <p className="text-sm text-slate-400">
                                                                Send a test email to verify your SMTP settings
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleTestEmail}
                                                        disabled={testingEmail}
                                                        className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {testingEmail ? (
                                                            <>
                                                                <FaSpinner className="animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaPaperPlane />
                                                                Send Test Email
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
};

export default AdminConfig;
