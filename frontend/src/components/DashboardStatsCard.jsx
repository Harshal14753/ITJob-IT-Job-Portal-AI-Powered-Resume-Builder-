import { BriefcaseBusiness } from "lucide-react";

const DashboardStatsCard = ({ totalJobs }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">

            <div className="flex justify-between items-center">

                <div>
                    <p className="text-blue-100 text-sm">
                        Total Jobs Posted
                    </p>

                    <h1 className="text-4xl font-bold mt-2">
                        {totalJobs}
                    </h1>

                    <p className="mt-3 text-sm text-blue-100">
                        Manage and track all your job postings.
                    </p>
                </div>

                <div className="bg-white/20 rounded-full p-5">
                    <BriefcaseBusiness size={45} />
                </div>

            </div>

        </div>
    );
};

export default DashboardStatsCard;