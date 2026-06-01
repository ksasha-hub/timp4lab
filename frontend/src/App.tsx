import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { EntityListPage } from './pages/EntityListPage';
import { EntityDetailsPage } from './pages/EntityDetailsPage';
import { DashboardPage } from './pages/DashboardPage';

function LegacyEntityRedirect() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const suffix = search ? `?${search}` : '';

  if (!params.entity) return <Navigate to="/dashboard" replace />;

  if (params.id && params.mode) {
    return <Navigate to={`/${params.entity}/${params.id}/${params.mode}${suffix}`} replace />;
  }

  if (params.id) {
    return <Navigate to={`/${params.entity}/${params.id}${suffix}`} replace />;
  }

  if (params.mode) {
    return <Navigate to={`/${params.entity}/${params.mode}${suffix}`} replace />;
  }

  return <Navigate to={`/${params.entity}${suffix}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/entities/:entity" element={<LegacyEntityRedirect />} />
      <Route path="/entities/:entity/:mode" element={<LegacyEntityRedirect />} />
      <Route path="/entities/:entity/:id" element={<LegacyEntityRedirect />} />
      <Route path="/entities/:entity/:id/:mode" element={<LegacyEntityRedirect />} />
      <Route path="/:entity" element={<EntityListPage />} />
      <Route path="/:entity/new" element={<EntityListPage />} />
      <Route path="/:entity/:id/edit" element={<EntityListPage />} />
      <Route path="/:entity/:id/delete" element={<EntityListPage />} />
      <Route path="/:entity/:id" element={<EntityDetailsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
