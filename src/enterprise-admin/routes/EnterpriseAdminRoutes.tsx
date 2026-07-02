import { Route } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDashboard } from '../pages/AdminDashboard';
import { UsersPage } from '../pages/UsersPage';
import { RolesPage } from '../pages/RolesPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

export const enterpriseAdminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="roles" element={<RolesPage />} />
    <Route path="permissions" element={<PlaceholderPage title="Permissions Matrix" />} />
    <Route path="audit" element={<PlaceholderPage title="Audit Log" />} />
    <Route path="sessions" element={<PlaceholderPage title="Active Sessions" />} />
    <Route path="api-keys" element={<PlaceholderPage title="API Keys" />} />
    <Route path="tenants" element={<PlaceholderPage title="Tenants" />} />
    <Route path="departments" element={<PlaceholderPage title="Departments" />} />
    <Route path="locations" element={<PlaceholderPage title="Service Locations" />} />
  </Route>
);
