import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaGlobe,
  FaBriefcase,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaUserTag,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  deleteRecruiterProfile,
} from "../../services/RecruiterService";
import { useToast } from "../../components/Toast";

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    department: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getRecruiterProfile();
      setProfile(data);
      setFormData({
        companyName: data.companyName || "",
        companyWebsite: data.companyWebsite || "",
        department: data.department || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (
      formData.companyWebsite &&
      !/^https?:\/\/.+/.test(formData.companyWebsite)
    ) {
      newErrors.companyWebsite = "Please enter a valid website URL";
    }

    return newErrors;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateRecruiterProfile({
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        department: formData.department,
      });
      setProfile(updated);
      setEditing(false);
      addToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      companyName: profile?.companyName || "",
      companyWebsite: profile?.companyWebsite || "",
      department: profile?.department || "",
    });
    setErrors({});
    setEditing(false);
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("userData");
    localStorage.removeItem("email");
    navigate("/");
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteRecruiterProfile();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("profileCompleted");
      addToast("Profile deleted successfully.", "info");
      navigate("/hire");
    } catch (error) {
      console.error("Error deleting profile:", error);
      addToast("Failed to delete profile. Please try again.", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-md">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-500 mb-4">
            Failed to load profile. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/hire/dashboard")}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={fetchProfile}
              className="bg-[#2557A7] text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/hire/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition mb-6"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Company Profile
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your company information displayed on job postings.
            </p>
          </div>

          {!editing && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                <FaEdit />
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                <FaTrash />
                Delete
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-800 transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Company Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-8 py-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaBuilding className="text-4xl text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {profile?.companyName || "Your Company"}
                </h2>
                <p className="text-blue-100 mt-1">
                  {profile?.department || "Department"}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            /* Edit Mode */
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">
                Edit Company Information
              </h3>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div
                  className={`flex items-center border rounded-xl px-4 h-12 ${
                    errors.companyName
                      ? "border-red-500"
                      : "border-gray-300 focus-within:border-[#2557A7]"
                  }`}
                >
                  <FaBuilding className="text-gray-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Example: Google"
                    maxLength={255}
                    className="w-full outline-none bg-transparent"
                  />
                </div>
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-4 h-12 focus-within:border-[#2557A7]">
                  <FaGlobe className="text-gray-400 mr-3 shrink-0" />
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    maxLength={255}
                    className="w-full outline-none bg-transparent"
                  />
                </div>
                {errors.companyWebsite && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.companyWebsite}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-4 h-12 focus-within:border-[#2557A7]">
                  <FaBriefcase className="text-gray-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering, HR, Talent Acquisition..."
                    maxLength={255}
                    className="w-full outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-blue-600 shrink-0" />
                    <span className="text-gray-800">
                      {profile?.email || "—"}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center gap-3">
                    <FaUserTag className="text-blue-600 shrink-0" />
                    <span className="text-gray-800">
                      {profile?.role || "Recruiter"}
                    </span>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Company Name
                  </label>
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-blue-600 shrink-0" />
                    <span className="text-gray-800">
                      {profile?.companyName || "Not set"}
                    </span>
                  </div>
                </div>

                {/* Company Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Company Website
                  </label>
                  <div className="flex items-center gap-3">
                    <FaGlobe className="text-blue-600 shrink-0" />
                    {profile?.companyWebsite ? (
                      <a
                        href={profile.companyWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {profile.companyWebsite}
                      </a>
                    ) : (
                      <span className="text-gray-800">Not set</span>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Department
                  </label>
                  <div className="flex items-center gap-3">
                    <FaBriefcase className="text-blue-600 shrink-0" />
                    <span className="text-gray-800">
                      {profile?.department || "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              {profile?.jobPosted && profile.jobPosted.length > 0 && (
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <FaBriefcase className="text-blue-600" />
                    <p className="text-sm text-blue-800">
                      You have{" "}
                      <span className="font-semibold">
                        {profile.jobPosted.length}
                      </span>{" "}
                      active job posting(s).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FaExclamationTriangle className="text-red-600 text-3xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Profile?
              </h3>

              <p className="text-gray-500 text-sm mb-1">
                Are you sure you want to delete your company profile?
              </p>

              <p className="text-gray-500 text-sm mb-6">
                This will permanently remove your account and all job postings.
                This action cannot be undone.
              </p>

              <div className="bg-gray-50 rounded-lg px-4 py-3 w-full mb-6">
                <p className="font-semibold text-gray-800">
                  {profile?.companyName || "Your Company"}
                </p>
                <p className="text-sm text-gray-500">
                  {profile?.email || ""}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterProfile;
