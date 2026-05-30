import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import InstallPage from './pages/InstallPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import OnboardingFlow from './onboarding/OnboardingFlow'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile/:profileId" element={<ProfilePage />} />
        <Route path="profile/:profileId/install" element={<InstallPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
