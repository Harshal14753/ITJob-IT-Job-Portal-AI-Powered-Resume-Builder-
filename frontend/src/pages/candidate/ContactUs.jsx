import React, { useContext } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { SiteConfigContext } from "../../context/SiteConfigContext";

const ContactUs = () => {
    const { supportEmail, contactNumber, companyName, websiteName } =
        useContext(SiteConfigContext);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
                    <p className="text-gray-500 mt-2">
                        Get in touch with us — we're here to help
                    </p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <FaEnvelope className="text-xl text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        {supportEmail ? (
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                {supportEmail}
                            </a>
                        ) : (
                            <p className="text-gray-400 text-sm">Not configured</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <FaPhone className="text-xl text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                        {contactNumber ? (
                            <a
                                href={`tel:${contactNumber.replace(/\s/g, "")}`}
                                className="text-green-600 hover:underline text-sm"
                            >
                                {contactNumber}
                            </a>
                        ) : (
                            <p className="text-gray-400 text-sm">Not configured</p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                            <FaMapMarkerAlt className="text-xl text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                        <p className="text-gray-600 text-sm">
                            {companyName || websiteName}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
