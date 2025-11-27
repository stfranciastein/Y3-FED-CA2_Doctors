import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { Link } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// For some reason this file is giving an error on vscode, but it doesn't seem to affect the build or functionality.
// Asking chatGPT didn't help either, but for now this functions as intended. 
// This code was directly lifted from the components/ui/sidebar documentation from Shadcn/ui.

// Actual menu items.
// When adding new routes, remember to also update the router configuration in router before putting new items here or you will get 404s.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: Inbox,
  },
  {
    title: "Patients",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

// The AppSidebar component which actually renders the sidebar.
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}