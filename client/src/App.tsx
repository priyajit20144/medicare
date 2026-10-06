import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { ScrollToTopOnNav } from './components/scroll';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { DoctorLayout } from './layouts/DoctorLayout';

// Route Guards
import { ProtectedRoute, RoleProtectedRoute } from './routes/RouteGuards';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { MedicinesPage } from './pages/medicines/MedicinesPage';
import { MedicineDetailPage } from './pages/medicines/MedicineDetailPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { DoctorDetailPage } from './pages/doctors/DoctorDetailPage';
import { HealthCheckupsPage } from './pages/checkups/HealthCheckupsPage';
import { HealthCheckupDetailPage } from './pages/checkups/HealthCheckupDetailPage';
import { FacilitiesPage } from './pages/facilities/FacilitiesPage';
import { FacilityDetailPage } from './pages/facilities/FacilityDetailPage';
import { PremiumPage } from './pages/premium/PremiumPage';

// Commerce & Upload
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { PrescriptionUploadPage } from './pages/prescriptions/PrescriptionUploadPage';

// User Portal Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { UserOrdersPage } from './pages/user/UserOrdersPage';
import { UserOrderDetailPage } from './pages/user/UserOrderDetailPage';
import { UserPrescriptionsPage } from './pages/user/UserPrescriptionsPage';
import { UserAppointmentsPage } from './pages/user/UserAppointmentsPage';
import { UserCheckupsPage } from './pages/user/UserCheckupsPage';
import { UserMembershipPage } from './pages/user/UserMembershipPage';
import { UserNotificationsPage } from './pages/user/UserNotificationsPage';
import { UserProfilePage } from './pages/user/UserProfilePage';

// Clinical & Pharmacy Dashboards
import { PharmacistDashboardPage } from './pages/pharmacist/PharmacistDashboardPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';

// Administrative Operations
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMedicinesPage } from './pages/admin/AdminMedicinesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPackagesPage } from './pages/admin/AdminPackagesPage';
import { AdminPremiumCheckupsPage } from './pages/admin/AdminPremiumCheckupsPage';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes cache
    },
  },
});

export const App: React.FC = () => {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTopOnNav />
        <Routes>
          {/* Public & Customer Storefront (MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/medicines/:id" element={<MedicineDetailPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/health-checkups" element={<HealthCheckupsPage />} />
            <Route path="/health-checkups/:id" element={<HealthCheckupDetailPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/facilities/:id" element={<FacilityDetailPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Authenticated Customer Actions */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/upload"
              element={
                <ProtectedRoute>
                  <PrescriptionUploadPage />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* User / Patient Protected Portal (DashboardLayout) */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="orders" element={<UserOrdersPage />} />
            <Route path="orders/:id" element={<UserOrderDetailPage />} />
            <Route path="prescriptions" element={<UserPrescriptionsPage />} />
            <Route path="prescriptions/:id" element={<UserPrescriptionsPage />} />
            <Route path="appointments" element={<UserAppointmentsPage />} />
            <Route path="health-checkups" element={<UserCheckupsPage />} />
            <Route path="membership" element={<UserMembershipPage />} />
            <Route path="notifications" element={<UserNotificationsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="settings" element={<UserProfilePage />} />
          </Route>

          {/* Pharmacist Review Console (MainLayout) */}
          <Route
            path="/pharmacist"
            element={
              <RoleProtectedRoute roles={['PHARMACIST', 'ADMIN']}>
                <MainLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<PharmacistDashboardPage />} />
            <Route path="prescriptions" element={<PharmacistDashboardPage />} />
            <Route path="prescriptions/:id" element={<PharmacistDashboardPage />} />
          </Route>

          {/* Doctor Clinical Dashboard (Dedicated DoctorLayout) */}
          <Route
            path="/doctor"
            element={
              <RoleProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                <DoctorLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboardPage />} />
            <Route path="appointments" element={<DoctorDashboardPage />} />
            <Route path="availability" element={<DoctorDashboardPage />} />
            <Route path="patients" element={<DoctorDashboardPage />} />
            <Route path="prescriptions" element={<DoctorDashboardPage />} />
            <Route path="messages" element={<DoctorDashboardPage />} />
            <Route path="reports" element={<DoctorDashboardPage />} />
            <Route path="profile" element={<DoctorDashboardPage />} />
            <Route path="settings" element={<DoctorDashboardPage />} />
          </Route>

          {/* Admin Back-Office (AdminLayout) */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute roles={['ADMIN']}>
                <AdminLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="medicines" element={<AdminMedicinesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="premium-checkups" element={<AdminPremiumCheckupsPage />} />
            <Route path="facilities" element={<AdminFacilitiesPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
