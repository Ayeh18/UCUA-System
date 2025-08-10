import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bannerImage from "../assets/Pelabuhan.jpeg"; // 🔁 adjust your path

const Register = () => {
  const [formData, setFormData] = useState({
    staffID: "",
    password: "",
    name: "",
    designation: "",
    department: "",
    deptQHSE: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "email" && !formData[key as keyof typeof formData]) {
        newErrors[key] = `${key} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    ...formData,
    department: formData.department.trim(), // in case user types space
  };

  try {
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Registration successful!");
      navigate("/login");
    } else {
      const errorData = await res.json();
      setErrorMessage(errorData.detail || "Failed to register.");
    }
  } catch (error) {
    console.error("Error:", error);
    setErrorMessage("Network error. Please try again later.");
  }
};


  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-4 pt-8 pb-10">
    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl grid grid-cols-1 md:grid-cols-2">

      {/* Background blur layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 opacity-20 blur-lg z-0"></div>

      {/* Left Side (Image) */}
      <div className="relative hidden md:block z-10">
        <img
          src={bannerImage}
          alt="Register banner"
          className="w-full h-full object-cover brightness-110"
        />
      </div>

      {/* Right Side (Form) */}
      <div className="p-10 relative z-10"> {/* <-- this fixes the interaction issue */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Your Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
        >
          {[...formDataFields()].map(({ label, name, type, placeholder }) => (
            <div key={name} className="col-span-1">
              <label htmlFor={name} className="block text-gray-700 font-medium mb-2">
                {label}
              </label>
              <input
                className={`border ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                } rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring focus:ring-purple-400`}
                id={name}
                type={type}
                placeholder={placeholder || `Enter ${label}`}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          {errorMessage && (
            <p className="col-span-full text-red-500 text-md italic mb-2 text-center">
              {errorMessage}
            </p>
          )}

          <div className="col-span-full flex items-center justify-center mt-4">
            <button
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-4 px-16 rounded-full focus:outline-none hover:shadow-lg hover:scale-105 transition-transform duration-300"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-600 font-semibold cursor-pointer hover:underline"
            >
              Log In
            </span>
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6 mb-2">
          &copy;2025 TBSB Sdn Bhd. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);

};

// Utility function to keep form structure clean
const formDataFields = () => [
  { label: "Staff ID", name: "staffID", type: "text" },
  { label: "Password", name: "password", type: "password" },
  { label: "Full Name", name: "name", type: "text" },
  { label: "Designation", name: "designation", type: "text" },
  { label: "Department", name: "department", type: "text" },
  { label: "Dept QHSE", name: "deptQHSE", type: "text" },
  { label: "Phone Number", name: "phone", type: "tel" },
  {
    label: (
      <>
        Email <span className="text-gray-500 font-normal">(Optional)</span>
      </>
    ),
    name: "email",
    type: "text",
    placeholder: "Enter your email",
  },
];

export default Register;
