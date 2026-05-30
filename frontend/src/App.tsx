import { Navigate, Route, Routes } from 'react-router-dom';
import { EntityDetailsPage } from './pages/EntityDetailsPage';
import { EntityListPage } from './pages/EntityListPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/entities/:entity' element={<EntityListPage />} />
      <Route path='/entities/:entity/:id' element={<EntityDetailsPage />} />
      <Route path='*' element={<Navigate to='/entities/departments' replace />} />
    </Routes>
  );
}
