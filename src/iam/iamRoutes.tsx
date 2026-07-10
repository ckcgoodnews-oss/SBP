import { Route } from 'react-router-dom';
import { RequirePermission } from './components/RequirePermission';
import UserDirectory from './pages/UserDirectory';
import CreateUserWizard from './pages/CreateUserWizard';
import RoleBuilder from './pages/RoleBuilder';
import AuditLogViewer from './pages/AuditLogViewer';

export const iamRoutes = (
  <>
    <Route path="/admin/iam/users" element={<RequirePermission module="iam" action="view"><UserDirectory /></RequirePermission>} />
    <Route path="/admin/iam/users/new" element={<RequirePermission module="iam" action="create"><CreateUserWizard /></RequirePermission>} />
    <Route path="/admin/iam/roles" element={<RequirePermission module="iam" action="configure"><RoleBuilder /></RequirePermission>} />
    <Route path="/admin/iam/audit" element={<RequirePermission module="audit" action="view"><AuditLogViewer /></RequirePermission>} />
  </>
);
