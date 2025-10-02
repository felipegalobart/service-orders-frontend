// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/dashboard/Home';
import PersonList from './pages/persons/List';
import { ServiceOrderList, ServiceOrderCreate, ServiceOrderEdit, ServiceOrderView, ServiceOrderDashboard } from './pages/serviceOrders';
import { ServiceOrderPrintPage } from './pages/serviceOrders/Print';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas (sem layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rota de impressão (sem layout) */}
          <Route path="/service-orders/print/:id" element={
            <ProtectedRoute>
              <ServiceOrderPrintPage />
            </ProtectedRoute>
          } />

          {/* Rotas protegidas (com layout) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Home />} />
            <Route path="persons" element={<PersonList />} />

            {/* Service Orders Routes */}
            <Route path="service-orders" element={<ServiceOrderList />} />
            <Route path="service-orders/create" element={<ServiceOrderCreate />} />
            <Route path="service-orders/edit/:id" element={<ServiceOrderEdit />} />
            <Route path="service-orders/view/:id" element={<ServiceOrderView />} />
            <Route path="service-orders/dashboard" element={<ServiceOrderDashboard />} />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;