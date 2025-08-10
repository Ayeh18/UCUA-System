import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ import this

const ResetPassword = () => {
  const [staffID, setStaffID] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // ⬅️ initialize navigation

  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (!staffID || !newPassword) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staff_id: staffID, new_password: newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Failed to reset password.");
      } else {
        setSuccess("Password reset successfully!");

        // Optional: clear input fields
        setStaffID("");
        setNewPassword("");

        // After 2 seconds, navigate to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Reset Password</h2>
        <input
          type="text"
          placeholder="Enter Staff ID"
          value={staffID}
          onChange={(e) => setStaffID(e.target.value)}
          className="w-full border rounded-md px-4 py-2 mb-4"
        />
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-md px-4 py-2 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
