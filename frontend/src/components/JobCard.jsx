import {
    MapPin,
    Briefcase,
    Users,
    IndianRupee,
    Pencil,
    Trash2,
    Eye,
    Globe,
} from "lucide-react";

const JobCard = ({ job, onEdit, onDelete, onApplicants }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300">

            <div className="p-6">

                {/* Header */}

                <div className="flex justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {job.title}
                        </h2>

                        <p className="text-blue-600 font-medium">
                            {job.companyName}
                        </p>

                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {job.jobType}
                    </span>

                </div>

                {/* Information */}

                <div className="grid md:grid-cols-2 gap-3 mt-6 text-gray-600">

                    <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        {job.location}
                    </div>

                    <div className="flex items-center gap-2">
                        <Briefcase size={18} />
                        {job.workLocation}
                    </div>

                    <div className="flex items-center gap-2">
                        <IndianRupee size={18} />
                        {job.salaryMin && job.salaryMax
                            ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
                            : job.salaryMin
                                ? `₹${job.salaryMin.toLocaleString()}`
                                : job.salaryMax
                                    ? `₹${job.salaryMax.toLocaleString()}`
                                    : "—"}
                    </div>

                    <div className="flex items-center gap-2">
                        <Users size={18} />
                        Vacancy : {job.vacancy}
                    </div>

                </div>

                {/* Skills */}

                <div className="mt-5">

                    <h3 className="font-semibold mb-2">
                        Required Skills
                    </h3>

                    <div className="flex flex-wrap gap-2">

                        {job.skills?.map((skill, index) => (

                            <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                                {skill}
                            </span>

                        ))}

                    </div>

                </div>

                {/* Benefits */}

                <div className="mt-5">

                    <h3 className="font-semibold mb-2">
                        Benefits
                    </h3>

                    <div className="flex flex-wrap gap-2">

                        {job.benefits?.map((benefit, index) => (

                            <span
                                key={index}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                            >
                                {benefit}
                            </span>

                        ))}

                    </div>

                </div>

                {/* Footer */}

                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-6 border-t pt-5">

                    <div className="space-y-2">

                        <p className="font-semibold text-blue-600">
                            Applications : {job.totalApplications}
                        </p>

                        {job.websiteLink && (
                            <a
                                href={job.websiteLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                            >
                                <Globe size={16} />
                                Company Website
                            </a>
                        )}

                    </div>

                    <div className="flex gap-3 mt-4 lg:mt-0">

                        <button
                            onClick={() => onApplicants(job.id)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Eye size={18} />
                            Applicants
                        </button>

                        <button
                            onClick={() => onEdit(job.id)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                        >
                            <Pencil size={18} />
                            Edit
                        </button>

                        <button
                            onClick={() => onDelete(job.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default JobCard;