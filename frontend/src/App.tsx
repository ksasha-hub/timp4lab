import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { EntityListPage } from './pages/EntityListPage';
import { EntityDetailsPage } from './pages/EntityDetailsPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/entities/:entity" element={<EntityListPage />} />
      <Route path="/entities/:entity/:id" element={<EntityDetailsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
