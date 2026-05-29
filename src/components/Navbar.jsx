import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Navbar Component
 * 
 * Shows different navigation based on login status:
 * - If logged out: Show Login and Signup buttons
 * - If logged in: Show user menu with Profile and Logout
 * 
 * Uses useAuth() hook - no prop drilling needed!
 */
function Navbar() {
  // Get auth state from context
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * handleLogout: Called when user clicks logout
   * 
   * Flow:
   * 1. Call logout() from auth context
   * 2. Clear token from localStorage
   * 3. Clear auth state
   * 4. Redirect to home page
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
          ArgueX
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          {/* ============================================ */}
          {/* LOGGED OUT: Show login/signup buttons       */}
          {/* ============================================ */}
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Signup
              </Link>
            </>
          ) : (
            /* ============================================ */
            /* LOGGED IN: Show user menu with logout      */
            /* ============================================ */
            <>
              {/* Dashboard Link */}
              <Link
                to="/dashboard"
                className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Dashboard
              </Link>

              {/* User Profile Section */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                {/* Username */}
                <Link
                  to="/profile"
                  className="text-sm font-medium text-slate-200 hover:text-white transition"
                >
                  {user?.username || user?.email}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/30"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
