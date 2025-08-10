import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Ensure correct import
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Form = () => {
  const [formData, setFormData] = useState({
    classification: "",
    stopWork: "",
    observation: "",
    action: "",
    location: "",
    images: [] as File[],
    specificLocation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isLocOpen, setLocOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/locations");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("Fetched locations:", data);
        setLocationOptions(data);
      } catch (err: any) {
        console.error("Error fetching locations:", err.message);
        setFetchError(err.message);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const { [name]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  // Validation
  const newErrors: Record<string, string> = {};
  if (!formData.location) newErrors.location = "Location is required.";
  if (!formData.classification)
    newErrors.classification = "Observation Classification is required.";
  if (!formData.stopWork) newErrors.stopWork = "Call for Stop Work is required.";
  if (!formData.observation)
    newErrors.observation = "Describe Your Observation is required.";
  if (!formData.action)
    newErrors.action = "Immediate Corrective Action is required.";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setLoading(false);
    return;
  }

  // Proceed with submission if no errors
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to submit.");
    setLoading(false);
    return;
  }

  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.sub) {
      alert("Invalid token payload. Please log in again.");
      setLoading(false);
      return;
    }
    console.log("Decoded staff_id:", decoded.sub);
  } catch (err) {
    console.error("Token decoding error:", err);
    alert("Invalid login session. Please log in again.");
    setLoading(false);
    return;
  }

  const form = new FormData();
  form.append("classification", formData.classification);
  form.append("stopWork", formData.stopWork);
  form.append("observation", formData.observation);
  form.append("action", formData.action);
  form.append("location", formData.location);
  form.append("specificLocation", formData.specificLocation || "");

  formData.images.forEach((file) => {
    form.append("images", file);
  });

  try {
    const res = await fetch("http://localhost:8000/api/form_staff", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("accessToken");
      window.location.href = "/";
      return;
    }

    const result = await res.json();
    console.log("Response status:", res.status);
    console.log("Response body:", result);

    if (res.ok) {
      navigate("/alert-staff");
    } else {
      alert("Submission failed.");
    }
  } catch (err) {
    console.error("Submit failed:", err);
    alert("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
  <div className="min-h-screen bg-[url('src/assets/form2.gif')] bg-cover bg-center">
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto px-4 sm:px-8 py-12 md:pt-28 space-y-10"
    >
      <div className="bg-white/40 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-black/20 ">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Observation Form</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            ref={(el) => {
              fieldRefs.current["location"] = el;
            }}
            className="relative"
          >
            <label className="block text-lg font-medium mb-1">Location</label>

            <div
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base flex justify-between items-center cursor-pointer"
              onClick={() => setLocOpen(!isLocOpen)}
            >
              <span>{formData.location || "Choose Location"}</span>
              {isLocOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            {/* Dropdown list */}
            {isLocOpen && (
              <ul className="absolute z-10 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-md">
                {locationOptions.map((loc) => (
                  <li
                    key={loc}
                    onClick={() => {
                      setFormData({ ...formData, location: loc });
                      setLocOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}

            {/* Error fetching locations */}
            {fetchError && (
              <p className="text-red-600 text-sm italic mt-2">
                Failed to load locations: {fetchError}
              </p>
            )}

            {errors.location && (
              <p className="text-red-600 text-sm mt-1 italic">
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium mb-1">
              Specific Location{" "}
            </label>
            <input
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observation Classification */}
          <div
            ref={(el) => {
              fieldRefs.current["classification"] = el;
            }}
          >
            <label className="block text-xl font-semibold mb-3">
              Observation Classification
            </label>
            <div className="space-y-3">
              {["Safe Observation", "Unsafe Acts", "Unsafe Conditions"].map(
                (val) => (
                  <label className="flex items-center gap-3 text-lg" key={val}>
                    <input
                      type="radio"
                      name="classification"
                      value={val}
                      checked={formData.classification === val}
                      onChange={handleChange}
                      className="accent-blue w-5 h-5"
                    />
                    {val}
                  </label>
                )
              )}
              {errors.classification && (
                <p className="text-red-500 text-sm italic">
                  {errors.classification}
                </p>
              )}
            </div>
          </div>

          {/* Call for Stop Work */}
          <div
            ref={(el) => {
              fieldRefs.current["stopWork"] = el;
            }}
          >
            <label className="block text-xl font-semibold mb-3">
              Call for Stop Work
            </label>
            <div className="space-y-3">
              {["Yes", "No"].map((val) => (
                <label className="flex items-center gap-3 text-lg" key={val}>
                  <input
                    type="radio"
                    name="stopWork"
                    value={val}
                    checked={formData.stopWork === val}
                    onChange={handleChange}
                    className="accent-blue w-5 h-5"
                  />
                  {val}
                </label>
              ))}
              {errors.stopWork && (
                <p className="text-red-500 text-sm italic">{errors.stopWork}</p>
              )}
            </div>
          </div>
        </div>

        {/* Observation Description */}
        <div
          ref={(el) => {
            fieldRefs.current["observation"] = el;
          }}
          className="mt-8"
        >
          <label className="block text-xl font-semibold mb-3">
            Describe Your Observation
          </label>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={handleChange}
            rows={4}
            placeholder="Write your observation here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.observation && (
            <p className="text-red-500 text-sm italic mt-1">
              {errors.observation}
            </p>
          )}
        </div>

        {/* Corrective Action */}
        <div
          ref={(el) => {
            fieldRefs.current["action"] = el;
          }}
          className="mt-6"
        >
          <label className="block text-xl font-semibold mb-3">
            Immediate Corrective Action
          </label>
          <textarea
            name="action"
            value={formData.action}
            onChange={handleChange}
            rows={4}
            placeholder="What action did you take?"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.action && (
            <p className="text-red-500 text-sm italic mt-1">
              {errors.action}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white/40 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-black/20">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Upload Files</h2>

        <label
          htmlFor="fileInput"
          className="flex flex-col items-center justify-center border-2 border-dotted border-gray-700 rounded-md p-8 cursor-pointer"
        >
          <span className="text-gray-900 text-lg mb-2">Select File here</span>

          <input
            id="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
            Choose File
          </div>
        </label>

        {/* Display selected file titles */}
        {formData.images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-800">Selected Files:</h3>
            {formData.images.map((file, index) => (
              <p key={index} className="text-gray-700 text-sm">
                {file.name}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="text-center pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900"
          } text-white text-lg sm:text-xl font-bold px-12 py-4 rounded-full shadow-lg transition`}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  </div>
);

};

export default Form;
