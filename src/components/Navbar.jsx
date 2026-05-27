import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
          ArgueX
        </Link>

        <nav className="flex items-center gap-3">
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
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
