import * as React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import axios from "axios"
import {
  IconCamera,
  IconChartBar,
  IconConfetti,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconHome,
  IconListDetails,
  IconMapPin,
  IconMicrophone,
  IconReport,
  IconSearch,
  IconSettings,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Statistics",
      url: "/stats",
      icon: IconChartBar,
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: IconTicket,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: IconUsers,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: IconListDetails,
    },
    {
      title: "Diagnoses",
      url: "/diagnoses",
      icon: IconFileDescription,
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { token } = useAuth();
  const [user, setUser] = useState({
    name: "Not Logged In",
    email: "Please log in",
    avatar: "/avatars/default.jpg",
  });

  useEffect(() => {
    const getUserData = async () => {
      if (token) {
        try {
          // Get user data from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser({
              name: `${userData.first_name} ${userData.last_name}`,
              email: userData.email,
              avatar: "/avatars/default.jpg",
            });
          } else {
            // Fallback to decoding token if user data not in localStorage
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            setUser({
              name: payload.email?.split('@')[0] || "User",
              email: payload.email || "user@harper.fest",
              avatar: "/avatars/default.jpg",
            });
          }
        } catch (decodeErr) {
          console.log("Could not decode token:", decodeErr);
        }
      } else {
        // Reset to not logged in state
        setUser({
          name: "Not Logged In",
          email: "Please log in",
          avatar: "/avatars/default.jpg",
        });
      }
    };

    getUserData();
  }, [token]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <svg className="!size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span className="text-base font-semibold">IADT Medical</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain.filter(item => item.title !== "Dashboard")} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
