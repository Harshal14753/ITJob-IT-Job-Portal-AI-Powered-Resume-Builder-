import React from "react";
import {
  FaCheck,
  FaCrown,
  FaRocket,
  FaStar,
} from "react-icons/fa";

const Pricing = () => {
  const freeFeatures = [
    "1 Active Job Post",
    "Search Visibility",
    "Candidate Management",
    "Automated Messages",
    "Application Tracking",
    "Email Support",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Matched Candidates",
    "AI Recommendations",
    "Urgently Hiring Badge",
    "Branded Jobs",
    "Unlimited Jobs",
    "Smart Sourcing",
    "Priority Support",
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* Header */}
      <div className="text-center pt-10 pb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Pricing Plans
        </h1>

        <p className="text-gray-600 mt-2 text-sm">
          Choose the hiring solution that fits your business.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-10">

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Free Plan */}
          <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border border-gray-200
            p-7
            flex
            flex-col
          ">
            <div className="flex items-center gap-3 mb-5">
              <div className="
                h-12 w-12
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
              ">
                <FaRocket className="text-[#2557A7] text-xl" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Standard
                </h2>

                <p className="text-sm text-gray-500">
                  Best for small businesses
                </p>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-3xl font-bold text-[#2557A7]">
                Free
              </h3>

              <p className="text-sm text-gray-500">
                Forever free
              </p>
            </div>

            <p className="text-gray-600 text-sm leading-6 mb-6">
              Hire quickly with increased visibility and
              get your job in front of active candidates.
            </p>

            <div className="border-t pt-5 flex-1">
              <p className="font-medium mb-4">
                Included features:
              </p>

              <div className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <FaCheck className="text-green-600 text-sm" />

                    <span className="text-sm text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="
              mt-6
              border
              border-[#2557A7]
              text-[#2557A7]
              py-3
              rounded-lg
              font-medium
              hover:bg-[#2557A7]
              hover:text-white
              transition
            ">
              Post a Job
            </button>
          </div>

          {/* Premium */}
          <div className="
            rounded-2xl
            bg-gradient-to-r
            from-[#2f2f2f]
            to-[#3b3b3b]
            text-white
            p-7
            flex
            flex-col
            shadow-lg
            relative
          ">

            <div className="
              absolute
              top-5
              right-5
              bg-[#d9a55a]
              text-black
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              flex
              items-center
              gap-1
            ">
              <FaStar />
              Popular
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="
                h-12 w-12
                rounded-xl
                bg-[#d9a55a]/20
                flex
                items-center
                justify-center
              ">
                <FaCrown className="text-[#d9a55a] text-xl" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Premium
                </h2>

                <p className="text-sm text-gray-300">
                  Reach more quality candidates
                </p>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-3xl font-bold text-[#d9a55a]">
                ₹2,999
              </h3>

              <p className="text-sm text-gray-400">
                per month
              </p>
            </div>

            <p className="text-gray-300 text-sm leading-6 mb-6">
              Reach top talent and reduce hiring time
              with smart sourcing and AI recommendations.
            </p>

            <div className="border-t border-gray-600 pt-5 flex-1">
              <p className="font-medium mb-4">
                Everything in Standard plus:
              </p>

              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <FaCheck className="text-green-400 text-sm" />

                    <span className="text-sm text-gray-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="
              mt-6
              bg-[#d9a55a]
              text-black
              py-3
              rounded-lg
              font-medium
              hover:bg-[#c99445]
              transition
            ">
              Upgrade to Premium
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pricing;