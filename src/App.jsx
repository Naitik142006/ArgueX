import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DebatePage from './pages/DebatePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import DebateRoom from './components/DebateRoom.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import MultiplayerDebatePage from './pages/MultiplayerDebatePage.jsx';
import ReplayPage from './pages/ReplayPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route
          path="leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
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
          path="multiplayer/:roomId"
          element={
            <ProtectedRoute>
              <MultiplayerDebatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="replay/:id"
          element={
            <ProtectedRoute>
              <ReplayPage />
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
