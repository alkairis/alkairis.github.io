import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import AdminHome from './pages/AdminHome.jsx'
import SectionPage from './pages/SectionPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Routes>
        {/* Public portfolio */}
        <Route path="/" element={<App />} />

        {/* URL-only login (no link in the public UI) */}
        <Route path="/sign-me" element={<Login />} />

        {/* Protected admin area */}
        <Route
          path="/admin-me"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path=":sectionKey" element={<SectionPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
