import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import InstallPage from './pages/InstallPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import OnboardingFlow from './onboarding/OnboardingFlow'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Protects the /app area. If Supabase is configured and there's no user,
// bounce to the landing page. Before keys are added, it lets everyone
// through so you can keep building.
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (!isSupabaseConfigured()) return children
  if (loading) return <div style={{ padding: 40, color: '#9AA39D' }}>Loading…</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingFlow /></RequireAuth>} />
        <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="profile/:profileId" element={<ProfilePage />} />
          <Route path="profile/:profileId/install" element={<InstallPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
