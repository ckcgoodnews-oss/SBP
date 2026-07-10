import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { enterpriseRoutes } from '../routes/enterpriseRoutes';

const router = createBrowserRouter([...enterpriseRoutes, { path: '*', element: <div className="p-6">Route not found</div> }]);
export function AppEnterprise() { return <RouterProvider router={router} />; }
