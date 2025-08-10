import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Alert = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-teal-100 to-yellow-50 overflow-hidden px-4">
      {/* Background decorative blobs */}
      <div className="absolute w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse top-0 left-0"></div>
      <div className="absolute w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse top-20 right-10"></div>
      <div className="absolute w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 left-10"></div>

      {/* Success card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", type: "spring", stiffness: 120, damping: 14 }}
        className="relative bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-10 max-w-lg w-full text-center z-10"
      >
        {/* Success icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <div className="bg-teal-500 text-white rounded-full p-4 shadow-md">
            <svg
              className="w-20 h-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-3xl font-semibold text-teal-900 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Submitted! 🌞
        </motion.h2>

        {/* Message */}
        <motion.p
          className="text-sm text-teal-800 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Your report has been received. Thanks for making a difference!
        </motion.p>

        {/* Action buttons */}
        <div className="flex flex-col space-y-12 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center w-full max-w-md mx-auto">
          <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              className="w-full text-center bg-white text-teal-700 font-semibold px-6 py-4 rounded-xl shadow hover:bg-teal-100 transition"
            >
              Go to Dashboard
            </Link>
          </motion.div>
          <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/form_staff"
              className="w-full text-center bg-teal-600 text-white font-semibold px-6 py-4 rounded-xl shadow hover:bg-teal-700 transition"
            >
              Submit Another
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Alert;
