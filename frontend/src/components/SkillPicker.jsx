import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaCheck, FaSpinner, FaCogs } from "react-icons/fa";
import { getAllSkills } from "../services/JobService";

const SkillPicker = ({ selectedIds = [], onChange, placeholder = "Search skills...", maxHeight = 280 }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setAllSkills(data);
      } catch (err) {
        console.error("Failed to load skills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSkills = allSkills.filter((s) =>
    s.skill.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedSet = new Set(selectedIds);

  const toggleSkill = (skillId) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(skillId)) {
      newSet.delete(skillId);
    } else {
      newSet.add(skillId);
    }
    onChange(Array.from(newSet));
  };

  const removeSkill = (skillId) => {
    onChange(selectedIds.filter((id) => id !== skillId));
  };

  const selectedSkills = allSkills.filter((s) => selectedSet.has(s.id));

  return (
    <div ref={wrapperRef} className="relative">
      {/* Selected skills tags */}
      <div
        className="min-h-[42px] w-full border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selectedSkills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium"
          >
            <FaCogs size={10} />
            {skill.skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill.id); }}
              className="text-blue-400 hover:text-red-500 transition"
            >
              <FaTimes size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedIds.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-none outline-none text-sm bg-transparent py-0.5"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ maxHeight }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <FaSpinner className="animate-spin text-blue-400 text-lg" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              {searchText ? "No matching skills found" : "No skills available"}
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: maxHeight - 8 }}>
              {filteredSkills.map((skill) => {
                const isSelected = selectedSet.has(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <FaCheck size={10} className="text-white" />}
                    </div>
                    <span className="flex-1 text-gray-700">{skill.skill}</span>
                    {skill.description && (
                      <span className="text-xs text-gray-400 truncate max-w-[120px]">
                        {skill.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillPicker;
