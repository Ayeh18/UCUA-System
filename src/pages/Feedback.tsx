import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import backgroundImage from "C:/Users/My PC/ucux-app/src/assets/TBSB Desktop Wallpaper  4K.jpg";

const Feedback = () => {
  const [message, setMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const feedbackTypeOptions = ["Suggestion", "Issue", "Comment"];

  // Close dropdown if click outside
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!feedbackType) {
      setError("Please select a feedback type.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("feedback_type", feedbackType);

      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit feedback.");
      }

      setSubmitted(true);
      setMessage("");
      setFeedbackType("");
      setLoading(false);
      setTimeout(() => setSubmitted(false), 4000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-slate-200 transition-all duration-300">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          We’d love your feedback!
        </h2>

        {submitted && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-green-50 text-green-700 border border-green-200 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>Your feedback has been received. Thank you!</span>
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Feedback Type Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Feedback Type <span className="text-red-500">*</span>
            </label>
            <div
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base flex justify-between items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{feedbackType || "Choose Feedback Type"}</span>
              {isDropdownOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            {isDropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-md">
                {feedbackTypeOptions.map((type) => (
                  <li
                    key={type}
                    onClick={() => {
                      setFeedbackType(type);
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Your Feedback
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your thoughts here..."
              required
              disabled={loading}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Submitting..." : "Send Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
