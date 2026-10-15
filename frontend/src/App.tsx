import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { FeatureGuard } from './components/auth/FeatureGuard';
import { RoleGuard } from './components/auth/RoleGuard';
import { useAuthStore } from './store/authStore';
import { useUserStore } from './store/userStore';
import { api } from './api/axios';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProviderConnections from './pages/settings/providers/ProviderConnections';
import Forbidden from './pages/errors/403';
import NotFound from './pages/errors/404';

import TicketList from './pages/tickets/TicketList';
import TicketCreate from './pages/tickets/TicketCreate';
import TicketDetail from './pages/tickets/TicketDetail';

import SiteList from './pages/monitoring/SiteList';
import SiteDetail from './pages/monitoring/SiteDetail';
import DeviceList from './pages/monitoring/DeviceList';
import DeviceDetail from './pages/monitoring/DeviceDetail';
import DevicePreviewMock from './pages/monitoring/DevicePreviewMock';
import { SecurityPreviewMock } from './pages/security/SecurityPreviewMock';
import AlertList from './pages/monitoring/AlertList';
import AlertDetail from './pages/monitoring/AlertDetail';

import SecurityDashboard from './pages/security/SecurityDashboard';
import SecurityEvents from './pages/security/SecurityEvents';
import Vulnerabilities from './pages/security/Vulnerabilities';
import SecurityEndpoints from './pages/security/SecurityEndpoints';

import BackupDashboard from './pages/backup/BackupDashboard';
import BackupJobs from './pages/backup/BackupJobs';
import BackupRepositories from './pages/backup/BackupRepositories';
import BackupAlerts from './pages/backup/BackupAlerts';

import Sla from './pages/sla/Sla';
import Contracts from './pages/contracts/Contracts';
import Usage from './pages/usage/Usage';

import UnifiedOperationsCenter from './pages/operations/UnifiedOperationsCenter';
import UnifiedAssetDetail from './pages/operations/UnifiedAssetDetail';
import AuditLogs from './pages/operations/AuditLogs';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import Providers from './pages/operations/Providers';
import SyncRuns from './pages/operations/SyncRuns';

function App() {
  const { token, setFeatures } = useAuthStore();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (token) {
      // Fetch User Profile
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(err => console.error("Failed to load user profile", err));

      // Fetch Features
      api.get('/subscriptions/my-features')
        .then(response => {
          setFeatures(response.data.features);
        })
        .catch(err => console.error("Failed to load features", err));
    }
  }, [token, setFeatures, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<RoleGuard roles={['ROLE_PLATFORM_ADMIN', 'ROLE_CUSTOMER_ADMIN']} redirectRoute="/403"><Settings /></RoleGuard>} />
            <Route path="/settings/providers" element={<RoleGuard roles={['ROLE_PLATFORM_ADMIN']} redirectRoute="/403"><ProviderConnections /></RoleGuard>} />
            
            <Route path="/tickets" element={<FeatureGuard featureKey="TICKETING" redirectRoute="/403"><TicketList /></FeatureGuard>} />
            <Route path="/tickets/new" element={<FeatureGuard featureKey="TICKETING" redirectRoute="/403"><TicketCreate /></FeatureGuard>} />
            <Route path="/tickets/:id" element={<FeatureGuard featureKey="TICKETING" redirectRoute="/403"><TicketDetail /></FeatureGuard>} />
            
            <Route path="/sites" element={<FeatureGuard featureKey="MONITORING_BASIC" redirectRoute="/403"><SiteList /></FeatureGuard>} />
            <Route path="/sites/:id" element={<FeatureGuard featureKey="MONITORING_BASIC" redirectRoute="/403"><SiteDetail /></FeatureGuard>} />
            <Route path="/devices" element={<FeatureGuard featureKey="MONITORING_BASIC" redirectRoute="/403"><DeviceList /></FeatureGuard>} />
            <Route path="/devices/:id" element={<FeatureGuard featureKey="MONITORING_BASIC" redirectRoute="/403"><DeviceDetail /></FeatureGuard>} />
            <Route path="/dev/device-preview" element={<DevicePreviewMock />} />
            <Route path="/dev/security-preview" element={<SecurityPreviewMock />} />
            <Route path="/alerts" element={<FeatureGuard featureKey="MONITORING_ALERTS" redirectRoute="/403"><AlertList /></FeatureGuard>} />
            <Route path="/alerts/:id" element={<FeatureGuard featureKey="MONITORING_ALERTS" redirectRoute="/403"><AlertDetail /></FeatureGuard>} />
            
            <Route path="/security" element={<FeatureGuard featureKey="SECURITY_BASIC" redirectRoute="/403"><SecurityDashboard /></FeatureGuard>} />
            <Route path="/security/events" element={<FeatureGuard featureKey="SECURITY_ALERTS" redirectRoute="/403"><SecurityEvents /></FeatureGuard>} />
            <Route path="/security/vulnerabilities" element={<FeatureGuard featureKey="SECURITY_VULNERABILITY" redirectRoute="/403"><Vulnerabilities /></FeatureGuard>} />
            <Route path="/security/endpoints" element={<FeatureGuard featureKey="SECURITY_ENDPOINT" redirectRoute="/403"><SecurityEndpoints /></FeatureGuard>} />

            <Route path="/backup" element={<FeatureGuard featureKey="BACKUP_BASIC" redirectRoute="/403"><BackupDashboard /></FeatureGuard>} />
            <Route path="/backup/jobs" element={<FeatureGuard featureKey="BACKUP_JOBS" redirectRoute="/403"><BackupJobs /></FeatureGuard>} />
            <Route path="/backup/repositories" element={<FeatureGuard featureKey="BACKUP_JOBS" redirectRoute="/403"><BackupRepositories /></FeatureGuard>} />
            <Route path="/backup/alerts" element={<FeatureGuard featureKey="BACKUP_ALERTS" redirectRoute="/403"><BackupAlerts /></FeatureGuard>} />

            <Route path="/admin/customers" element={<RoleGuard roles={['ROLE_PLATFORM_ADMIN']} redirectRoute="/403"><CustomersAdmin /></RoleGuard>} />

            <Route path="/operations" element={<UnifiedOperationsCenter />} />
            <Route path="/operations/providers" element={<Providers />} />
            <Route path="/operations/sync-runs" element={<SyncRuns />} />
            <Route path="/operations/assets/:id" element={<UnifiedAssetDetail />} />
            <Route path="/operations/audit" element={<AuditLogs />} />

            <Route path="/billing" element={<Billing />} />
            <Route path="/sla" element={<FeatureGuard featureKey="TICKETING" redirectRoute="/403"><Sla /></FeatureGuard>} />
            <Route path="/contracts" element={<RoleGuard roles={['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN']} redirectRoute="/403"><Contracts /></RoleGuard>} />
            <Route path="/usage" element={<RoleGuard roles={['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN']} redirectRoute="/403"><Usage /></RoleGuard>} />
          </Route>
        </Route>
        
        {/* Default redirect logic */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
