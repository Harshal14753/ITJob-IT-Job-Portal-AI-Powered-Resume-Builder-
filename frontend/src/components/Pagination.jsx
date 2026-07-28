import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
    currentPage,
    totalPages,
    totalElements,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
    variant = "dark",
}) => {
    if (totalPages <= 0) return null;

    const isDark = variant === "dark";
    const baseBg = isDark ? "bg-slate-700" : "bg-gray-200";
    const baseText = isDark ? "text-slate-400" : "text-gray-500";
    const hoverBg = isDark ? "hover:bg-slate-700" : "hover:bg-gray-200";
    const hoverText = isDark ? "hover:text-white" : "hover:text-gray-900";
    const activeBg = isDark ? "bg-purple-600" : "bg-blue-600";
    const activeText = "text-white";
    const selectBg = isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-700";
    const infoText = isDark ? "text-slate-400" : "text-gray-500";
    const infoHighlight = isDark ? "text-white" : "text-gray-900";

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(0);

            let start = Math.max(1, currentPage - 1);
            let end = Math.min(totalPages - 2, currentPage + 1);

            if (currentPage <= 2) {
                start = 1;
                end = Math.min(totalPages - 2, 3);
            }
            if (currentPage >= totalPages - 3) {
                start = Math.max(1, totalPages - 4);
                end = totalPages - 2;
            }

            if (start > 1) {
                pages.push("...");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 2) {
                pages.push("...");
            }

            pages.push(totalPages - 1);
        }

        return pages;
    };

    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            {/* Info */}
            <div className="flex items-center gap-4">
                <p className={`text-sm ${infoText}`}>
                    Showing{" "}
                    <span className={`font-medium ${infoHighlight}`}>
                        {startItem}–{endItem}
                    </span>{" "}
                    of{" "}
                    <span className={`font-medium ${infoHighlight}`}>
                        {totalElements}
                    </span>
                </p>
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className={`px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${selectBg}`}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size} per page
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg ${baseText} ${hoverText} ${hoverBg} transition disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    <FaChevronLeft className="text-xs" />
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className={`w-9 h-9 flex items-center justify-center ${baseText} text-sm`}
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                                page === currentPage
                                    ? `${activeBg} ${activeText} shadow-md`
                                    : `${baseText} ${hoverText} ${hoverBg}`
                            }`}
                        >
                            {page + 1}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg ${baseText} ${hoverText} ${hoverBg} transition disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    <FaChevronRight className="text-xs" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
