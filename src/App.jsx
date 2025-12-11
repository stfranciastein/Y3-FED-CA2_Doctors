import { AuthProvider } from '@/hooks/useAuth';

import { BrowserRouter as Router, Routes, Route } from "react-router";

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';

import DoctorsIndex from'@/pages/doctors/index.jsx';
import DoctorPage from '@/pages/doctors/Show.jsx';
import DoctorForm from '@/pages/doctors/create.jsx';
import DoctorDelete from '@/pages/doctors/delete.jsx';

import PatientsIndex from '@/pages/patients/index.jsx';
import PatientPage from '@/pages/patients/Show.jsx';
import PatientForm from '@/pages/patients/create.jsx';
import PatientDelete from '@/pages/patients/delete.jsx';

export default function App() {

return (
    <Router>
      <AuthProvider>
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
              {/* Main content */}
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/doctors" element={<DoctorsIndex />} />
                <Route path="/doctors/create" element={<DoctorForm />} /> 
                <Route path="/doctors/:id/edit" element={<DoctorForm />} />
                <Route path="/doctors/:id/delete" element={<DoctorDelete />} />
                <Route path="/doctors/:id" element={<DoctorPage />} />

                <Route path="/patients" element={<PatientsIndex />} />
                <Route path="/patients/create" element={<PatientForm />} /> 
                <Route path="/patients/:id/edit" element={<PatientForm />} />
                <Route path="/patients/:id/delete" element={<PatientDelete />} />
                <Route path="/patients/:id" element={<PatientPage />} />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      </AuthProvider> 

    </Router>
  );
}