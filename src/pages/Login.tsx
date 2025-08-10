import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [staffID, setStaffID] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isStaffIDInvalid, setIsStaffIDInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!staffID || !password) {
      setIsStaffIDInvalid(!staffID);
      setIsPasswordInvalid(!password);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staff_id: staffID, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.detail || "Login failed");
        return;
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      navigate("/form-staff");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient">
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl min-h-[500px] h-auto m-4 flex flex-col md:flex-row">
        {/* Background blur layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 opacity-20 blur-lg z-0"></div>

        {/* Left image */}
        <div className="hidden md:block w-1/2 z-10">
          <img
            src="src/assets/login.webp"
            alt="Login Illustration"
            className="object-cover w-full h-full rounded-l-2xl"
          />
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 p-8 h-full flex flex-col justify-center z-10 relative">
          <div className="max-w-xs mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center mt-6">
              Welcome Back
            </h2>
            <p className="text-md text-gray-500 mb-8 text-center">
              Log in to make your report
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
            >
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="staff_id">
                  Staff ID
                </label>
                <input
                  className={`shadow appearance-none border ${
                    isStaffIDInvalid ? "border-red-500" : "border-gray-300"
                  } rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-purple-400`}
                  id="staff_id"
                  type="text"
                  placeholder="Enter your Staff ID"
                  value={staffID}
                  onChange={(e) => setStaffID(e.target.value)}
                />
                {isStaffIDInvalid && (
                  <p className="text-red-500 text-md italic mt-1">Staff ID is required.</p>
                )}
              </div>

              <div className="mb-6 relative">
                <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className={`shadow appearance-none border ${
                      isPasswordInvalid ? "border-red-500" : "border-gray-300"
                    } rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-purple-400 pr-10`}
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {isPasswordVisible ? "👁️" : "🔒"}
                  </button>
                </div>
                {isPasswordInvalid && (
                  <p className="text-red-500 text-xs italic mt-1">Password is required.</p>
                )}
              </div>

              {errorMessage && <p className="text-red-500 text-md italic mb-2">{errorMessage}</p>}

              <div className="flex items-center justify-center mt-12">
                <button
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-16 rounded-full focus:outline-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  type="submit"
                >
                  Log In
                </button>
              </div>
            </form>

            <div className="text-center mt-8 -mb-1">
              <span
                onClick={() => navigate("/reset-password")}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Forgot your password?
              </span>
            </div>


            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="text-purple-600 font-semibold cursor-pointer hover:underline"
                >
                  Register Here
                </span>
              </p>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6 mb-6">
              &copy;2025 TBSB Sdn Bhd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
