import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Hamburger Button (mobile only) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 right-4 z-50 text-black text-3xl p-2 xl:hidden hover:scale-105 transition"
      >
        {isMobileMenuOpen ? '✖' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 text-white transition-all duration-300 ease-in-out
          shadow-xl border-r backdrop-blur-xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-72'}
          bg-gradient-to-b from-blue-600 via-blue-800 to-blue-900
          xl:flex flex-col
        `}
      >
        <div className="flex flex-col h-full px-3 relative">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white text-blue-800 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition-transform xl:block hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${
                isCollapsed ? '' : 'rotate-180'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>

          {/* Logo */}
          <div className="mt-10 mb-6 flex items-center justify-center xl:justify-start px-2 gap-3">
            <img src="src/assets/logo_tbsb.png" alt="Logo" className="w-16 h-16" />
            {!isCollapsed && <span className="text-2xl font-bold tracking-wide">e-UCUA</span>}
          </div>

          {/* Menu */}
          <nav className="mt-6 space-y-2">
            {[
              { to: '/form-staff', icon: '📋', label: 'Report Form' },
              { to: '/dashboard', icon: '📊', label: 'Dashboard' },
              { to: '/feedback', icon: '📝', label: 'Feedback' },
              { to: '/profile', icon: '👤', label: 'Profile' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive(to)
                    ? 'bg-white bg-opacity-25 font-semibold'
                    : 'hover:bg-white hover:bg-opacity-10'}
                `}
              >
                <span className="text-xl">{icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer Info (optional) */}
          {!isCollapsed && (
            <div className="mt-auto text-xs text-center text-white/70 py-4">
              © {new Date().getFullYear()} TBSB - UCUX
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
