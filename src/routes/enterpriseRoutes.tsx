import React from 'react';
import { RouteObject } from 'react-router-dom';
import { EnterpriseAdminLayout } from '../shared/layout/EnterpriseAdminLayout';
import { AdminDashboard } from '../features/administration/AdminDashboard';
import UsersPage from '../features/administration/users/UsersPage';
import RolesPage from '../features/administration/roles/RolesPage';
import PermissionsPage from '../features/administration/permissions/PermissionsPage';
import AuditPage from '../features/administration/audit/AuditPage';
import SessionsPage from '../features/administration/sessions/SessionsPage';
import ApiKeysPage from '../features/administration/apiKeys/ApiKeysPage';
import TenantsPage from '../features/administration/tenants/TenantsPage';
import DepartmentsPage from '../features/administration/departments/DepartmentsPage';
import LocationsPage from '../features/administration/locations/LocationsPage';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/admin', element: <EnterpriseAdminLayout />, children: [
    { index: true, element: <AdminDashboard /> },
    { path: 'users', element: <UsersPage /> },
    { path: 'roles', element: <RolesPage /> },
    { path: 'permissions', element: <PermissionsPage /> },
    { path: 'audit', element: <AuditPage /> },
    { path: 'sessions', element: <SessionsPage /> },
    { path: 'api-keys', element: <ApiKeysPage /> },
    { path: 'tenants', element: <TenantsPage /> },
    { path: 'departments', element: <DepartmentsPage /> },
    { path: 'locations', element: <LocationsPage /> },
  ] }
];
