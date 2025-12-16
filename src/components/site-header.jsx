import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocation } from "react-router"

export function SiteHeader() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/doctors')) return 'Doctors';
    if (path.startsWith('/patients')) return 'Patients';
    if (path.startsWith('/appointments')) return 'Appointments';
    if (path.startsWith('/diagnoses')) return 'Diagnoses';
    if (path.startsWith('/prescriptions')) return 'Prescriptions';
    if (path.startsWith('/stats')) return 'Statistics';
    
    return 'Documents';
  };

  return (
    <header
      className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-5 py-2 lg:gap-2 lg:px-7">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-sm font-normal">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/stfranciastein/Y3-FED-CA2_Doctors"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
