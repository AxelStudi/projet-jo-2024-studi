
import React, { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MfaVerificationPage from './pages/MfaVerificationPage';
import SetupMfaPage from './pages/SetupMfaPage';
import ProfilePage from './pages/ProfilePage';
import TicketHistoryPage from './pages/TicketHistoryPage';
import TicketPage from './pages/TicketPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminPage from './pages/admin/AdminPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminSalesPage from './pages/admin/AdminSalesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const App: React.FC = () => {
  const { checkAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div> {/* Vous pouvez remplacer ceci par un vrai spinner */}
      </div>
    );
  }
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/offres" element={<OffersPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/verification-mfa" element={<MfaVerificationPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/commande" element={<CheckoutPage />} />
              <Route path="/paiement" element={<CheckoutPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/configuration-mfa" element={<SetupMfaPage />} />
              <Route path="/historique" element={<TicketHistoryPage />} />
              <Route path="/billet/:id" element={<TicketPage />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/offres" element={<AdminOffersPage />} />
              <Route path="/admin/utilisateurs" element={<AdminUsersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
              <Route path="/admin/ventes" element={<AdminSalesPage />} />
              <Route path="/admin/rapports" element={<AdminReportsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

export default App;
