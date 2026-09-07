import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// The CMS is reachable only by typing its URL, so there's no reason to ship it
// to the visitors who never will. Splitting these routes keeps the admin
// pages, their forms and admin.css out of the public bundle.
const Login = lazy(() => import('./pages/Login.jsx'))
const AdminLayout = lazy(() => import('./pages/AdminLayout.jsx'))
const AdminHome = lazy(() => import('./pages/AdminHome.jsx'))
const SectionPage = lazy(() => import('./pages/SectionPage.jsx'))

// Inline styles: admin.css ships with the chunk this is waiting on.
const routeFallback = (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#4a7090',
    }}
  >
    Loading…
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Suspense fallback={routeFallback}>
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
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
