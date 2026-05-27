import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
