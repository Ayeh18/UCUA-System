  import React, { useState, useRef, useEffect } from "react";
  import { FaChevronDown, FaChevronRight } from "react-icons/fa";
  import { useNavigate } from "react-router-dom";

  const Form = () => {
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  designation: "",
  company: "",
  otherCompany: "",
  location: "",
  otherLocation: "",
  classification: "",
  stopWork: "",
  observation: "",
  action: "",
  images: [] as File[],
});


  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isDeptOpen, setDeptOpen] = useState(false);
  const [isLocOpen, setLocOpen] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

    // Fetch companies
    useEffect(() => {
      const fetchCompanies = async () => {
        try {
          const res = await fetch("http://localhost:8000/api/companies");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setCompanyOptions(data);
        } catch (err) {
          console.error("Error fetching companies:", err);
        }
      };
      fetchCompanies();
    }, []);

  // Fetch locations from the API
    useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/locations");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLocationOptions(data);
        setLocationOptions(data);
      } catch (err: any) {
        console.error("Error fetching locations:", err.message);
      }
    };
    fetchLocations();
  }, []);

  // Handle clicks outside the dropdowns
    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        fieldRefs.current["company"] &&
        !fieldRefs.current["company"]?.contains(event.target as Node) &&
        fieldRefs.current["location"] &&
        !fieldRefs.current["location"]?.contains(event.target as Node)
      ) {
        setDeptOpen(false);
        setLocOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prevErrors) => {
        const { [name]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, images: [...formData.images, file] });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

  // Validate required fields
  const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
    if (!formData.company.trim()) newErrors.company = "Company is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.classification.trim())
      newErrors.classification = "Classification is required.";
    if (!formData.stopWork.trim()) newErrors.stopWork = "Stop Work decision is required.";
    if (!formData.observation.trim())
      newErrors.observation = "Observation description is required.";
    if (!formData.action.trim())
      newErrors.action = "Corrective action is required.";

  // Display errors and stop submission if validation fails
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setLoading(false);
    return;
  }

  // Proceed with form submission
  const form = new FormData();
    form.append("name", formData.name);
    form.append("phone", formData.phone);
    form.append("designation", formData.designation);
    form.append("company", formData.company);
    form.append("otherCompany", formData.otherCompany || "");
    form.append("location", formData.location);
    form.append("otherLocation", formData.otherLocation || "");
    form.append("classification", formData.classification);
    form.append("stopWork", formData.stopWork);
    form.append("observation", formData.observation);
    form.append("action", formData.action);

    formData.images.forEach((file) => form.append("images", file));

  try {
    const res = await fetch("http://localhost:8000/form_visitor", {
      method: "POST",
      body: form,
    });

    await res.json();
    if (res.ok) {
      navigate("/alert-visitor");
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
          className="px-3 md:px-6 py-6 max-w-4xl mx-auto pt-12 space-y-6 rounded-xl"
        >
          {/* Personal Information */}
          <div
            ref={(el) => { fieldRefs.current["name"] = el; }}
            className="bg-white/20 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-black/20 shadow-lg space-y-8"
          >
            <h2 className="text-3xl font-bold">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div ref={(el) => { fieldRefs.current["name"] = el; }}>
                <label className="block text-lg font-medium mb-1">Observer Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1 italic">{errors.name}</p>}
              </div>


              <div ref={(el) => { fieldRefs.current["phone"] = el; }}>
                <label className="block text-lg font-medium mb-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1 italic">{errors.phone}</p>}
              </div>

              <div ref={(el) => { fieldRefs.current["company"] = el; }} className="relative">
                <label className="block text-lg font-medium mb-1">Company</label>
                <div
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-200 shadow-md text-base flex justify-between items-center cursor-pointer z-100"
                  onClick={() => setDeptOpen(!isDeptOpen)}
                >
                  <span>{formData.company || "Choose Company"}</span>
                  {isDeptOpen ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                {isDeptOpen && (
                  <ul className="absolute mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-md">
                    {companyOptions.length > 0 ? (
                      companyOptions.map((comp) => (
                        <li
                          key={comp}
                          onClick={() => {
                            setFormData({ ...formData, company: comp });
                            setDeptOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                          {comp}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500 italic">
                        No companies available
                      </li>
                    )}
                  </ul>
                )}
                {errors.company && <p className="text-red-600 text-sm mt-1 italic">{errors.company}</p>}
              </div>

              <div ref={(el) => { fieldRefs.current["otherCompany"] = el; }}>
                <label className="block text-lg font-medium mb-1">Other Company</label>
                <input
                  name="otherCompany"
                  value={formData.otherCompany}
                  onChange={handleChange}
                  placeholder="Enter other company"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.otherCompany && <p className="text-red-600 text-sm mt-1 italic">{errors.otherCompany}</p>}
              </div>

              <div ref={(el) => { fieldRefs.current["designation"] = el; }}>
                <label className="block text-lg font-medium mb-1">Observer Designation</label>
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                {errors.designation && <p className="text-red-600 text-sm mt-1 italic">{errors.designation}</p>}
              </div>

              
            </div>
          </div>

          {/* Observation Form */}
          <div className="bg-white/30 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-black/20 z-10">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Observation Form</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div ref={(el) => { fieldRefs.current["location"] = el; }} className="relative">
                <label className="block text-lg font-medium mb-1">Location</label>
                <div
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-200 shadow-md text-base flex justify-between items-center cursor-pointer"
                  onClick={() => setLocOpen(!isLocOpen)}
                >
                  <span>{formData.location || "Choose Location"}</span>
                  {isLocOpen ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                {isLocOpen && (
                  <ul className="absolute z-10 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-md">
                    {locationOptions.length > 0 ? (
                      locationOptions.map((loc) => (
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
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500 italic">
                        No locations available
                      </li>
                    )}
                  </ul>
                )}
                {errors.location && <p className="text-red-600 text-sm mt-1 italic">{errors.location}</p>}
              </div>


              <div>
                <label className="block text-lg font-medium mb-1">
                  Specific Location
                </label>
                <input
                  name="otherLocation"
                  value={formData.otherLocation}
                  onChange={handleChange}
                  placeholder="Enter specific location"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.otherLocation && (
                  <p className="text-red-600 text-sm mt-1 italic">{errors.otherLocation}</p>
                )}
              </div>

              <div ref={(el) => { fieldRefs.current["classification"] = el; }}>
                <label className="block text-xl font-semibold mb-3">Observation Classification</label>
                <div className="space-y-3">
                  {["Safe Observation", "Unsafe Acts", "Unsafe Conditions"].map((val) => (
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
                  ))}
                </div>
                {errors.classification && <p className="text-red-500 text-sm italic">{errors.classification}</p>}
              </div>

              <div ref={(el) => { fieldRefs.current["stopWork"] = el; }}>
                <label className="block text-xl font-semibold mb-3">Call for Stop Work</label>
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
                </div>
                {errors.stopWork && <p className="text-red-500 text-sm italic">{errors.stopWork}</p>}
              </div>

            </div>

            <div ref={(el) => { fieldRefs.current["observation"] = el; }} className="mt-8">
              <label className="block text-xl font-semibold mb-3">Describe Your Observation</label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleChange}
                rows={4}
                placeholder="Write your observation here..."
                className="w-full rounded-xl p-4 text-base border border-gray-400 bg-gray-100 shadow-md focus:outline-none focus:ring-2 focus:ring-black transition"
              />
              {errors.observation && (
                <p className="text-red-500 text-sm italic mt-1">{errors.observation}</p>
              )}
            </div>

            <div ref={(el) => { fieldRefs.current["action"] = el; }} className="mt-6">
              <label className="block text-xl font-semibold mb-3">Immediate Corrective Action</label>
              <textarea
                name="action"
                value={formData.action}
                onChange={handleChange}
                rows={4}
                placeholder="What action did you take?"
                className="w-full rounded-xl p-4 text-base border border-gray-400 bg-gray-100 shadow-md focus:outline-none focus:ring-2 focus:ring-black transition"
              />
              {errors.action && (
                <p className="text-red-500 text-sm italic mt-1">{errors.action}</p>
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
