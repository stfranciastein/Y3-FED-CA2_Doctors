import { AuthProvider } from '@/hooks/useAuth';
import { DarkModeProvider, useDarkMode } from '@/hooks/useDarkMode';

import { BrowserRouter as Router, Routes, Route } from "react-router";

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';

import DoctorsIndex from'@/pages/doctors/index.jsx';
import DoctorPage from '@/pages/doctors/Show.jsx';
import DoctorForm from '@/pages/doctors/create.jsx';

import PatientsIndex from '@/pages/patients/index.jsx';
import PatientPage from '@/pages/patients/Show.jsx';
import PatientForm from '@/pages/patients/create.jsx';

import AppointmentsIndex from '@/pages/appointments/index.jsx';
import AppointmentPage from '@/pages/appointments/Show.jsx';
import AppointmentForm from '@/pages/appointments/create.jsx';

import DiagnosesIndex from '@/pages/diagnoses/index.jsx';
import DiagnosisPage from '@/pages/diagnoses/Show.jsx';
import DiagnosisForm from '@/pages/diagnoses/create.jsx';

import PrescriptionsIndex from '@/pages/prescriptions/index.jsx';
import PrescriptionPage from '@/pages/prescriptions/Show.jsx';
import PrescriptionForm from '@/pages/prescriptions/create.jsx';

import StatsIndex from '@/pages/stats/index.jsx';

function DashboardLayout() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={isDarkMode ? 'dark bg-slate-900 min-h-screen' : 'bg-teal-50 min-h-screen'}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />

          <div className="flex flex-1 flex-col p-4 md:p-6">
            <div className="flex flex-1 flex-col gap-4 md:gap-6">
              <Routes>
                <Route path="/doctors" element={<DoctorsIndex />} />
                <Route path="/doctors/create" element={<DoctorForm />} /> 
                <Route path="/doctors/:id/edit" element={<DoctorForm />} />
                <Route path="/doctors/:id" element={<DoctorPage />} />

                <Route path="/patients" element={<PatientsIndex />} />
                <Route path="/patients/create" element={<PatientForm />} /> 
                <Route path="/patients/:id/edit" element={<PatientForm />} />
                <Route path="/patients/:id" element={<PatientPage />} />

                <Route path="/appointments" element={<AppointmentsIndex />} />
                <Route path="/appointments/create" element={<AppointmentForm />} /> 
                <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
                <Route path="/appointments/:id" element={<AppointmentPage />} />

                <Route path="/diagnoses" element={<DiagnosesIndex />} />
                <Route path="/diagnoses/create" element={<DiagnosisForm />} /> 
                <Route path="/diagnoses/:id/edit" element={<DiagnosisForm />} />
                <Route path="/diagnoses/:id" element={<DiagnosisPage />} />

                <Route path="/prescriptions" element={<PrescriptionsIndex />} />
                <Route path="/prescriptions/create" element={<PrescriptionForm />} /> 
                <Route path="/prescriptions/:id/edit" element={<PrescriptionForm />} />
                <Route path="/prescriptions/:id" element={<PrescriptionPage />} />

                <Route path="/stats" element={<StatsIndex />} />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function App() {

return (
    <Router>
      <DarkModeProvider>
      <AuthProvider>
        <Routes>
          {/* Home page - Full screen without sidebar */}
          <Route path="/" element={<Home />} />

          {/* All other routes - With sidebar layout */}
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </AuthProvider>
      </DarkModeProvider>
    </Router>
  );
}