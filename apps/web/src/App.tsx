import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { AdminAuditPage } from './pages/admin/AdminAuditPage'
import { AdminFortressEditorPage } from './pages/admin/AdminFortressEditorPage'
import { AdminFortressesPage } from './pages/admin/AdminFortressesPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage'
import { AboutPage } from './pages/AboutPage'
import { CatalogPage } from './pages/CatalogPage'
import { FortressPage } from './pages/FortressPage'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { RegisterPage } from './pages/RegisterPage'
import { RulesPage } from './pages/RulesPage'
import { SubmitPage } from './pages/SubmitPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<MapPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="fortress/:slug" element={<FortressPage />} />
          <Route path="submit" element={<SubmitPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="submissions" replace />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="fortresses" element={<AdminFortressesPage />} />
          <Route path="fortresses/new" element={<AdminFortressEditorPage mode="create" />} />
          <Route path="fortresses/:slug/edit" element={<AdminFortressEditorPage mode="edit" />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
