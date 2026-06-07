import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DebatePage from './pages/DebatePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import DebateRoom from './components/DebateRoom.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="debate"
          element={
            <ProtectedRoute>
              <DebatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="debate/:urlDebateId"
          element={
            <ProtectedRoute>
              <DebatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="room/:roomId"
          element={
            <ProtectedRoute>
              <DebateRoom />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
