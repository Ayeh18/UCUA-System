import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ✅ Type assertion for event.target
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="bg-slate-700 text-white shadow-lg relative z-50">
      <div className="flex justify-between items-center px-4 py-4 md:px-6">
      <img
        src="src/assets/tbsb.png"
        alt="UCUX Logo"
        className="h-10"
      />

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-200">Home</Link>
          <Link to="/login" className="hover:text-gray-200">Login</Link>
          <Link to="/form" className="hover:text-gray-200">Form</Link>
          <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden relative" ref={menuRef}>
          {isOpen ? (
            <button onClick={() => setIsOpen(false)} aria-label="Close menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button onClick={() => setIsOpen(true)} aria-label="Open menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Floating Panel */}
          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-4 space-y-3 text-white animate-fade-in"
            >
              <Link to="/" className="flex items-center gap-2 hover:bg-white/20 p-2 rounded text-black">
                <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Home
              </Link>

              <Link to="/login" className="flex items-center gap-2 hover:bg-white/20 p-2 rounded text-black">
                <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Login
              </Link>

              <Link to="/form" className="flex items-center gap-2 hover:bg-white/20 p-2 rounded text-black">
                <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Form
              </Link>

              <Link to="/dashboard" className="flex items-center gap-2 hover:bg-white/20 p-2 rounded text-black">
                <svg className="w-5 h-5" stroke="currenColor" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
