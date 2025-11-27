import { BrowserRouter as Router, Routes, Route } from "react-router";

// Sidebar to replace navbar
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

// Deprecated navbar
// import Navbar from '@/components/Navbar';

import Home from '@/pages/Home';

export default function App() {

  return (
    <>
      <Router>
        <SidebarProvider>
          <AppSidebar />
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
        </SidebarProvider>
      </Router>
    </>
  )
}