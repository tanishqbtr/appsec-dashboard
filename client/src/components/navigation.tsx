import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  ChartLine,
  ChevronDown,
  Box,
  Folder,
  Bug,
  BarChart,
  Settings,
  HelpCircle,
  User,
  Cog,
} from "lucide-react";

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="bg-primary shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-6 w-6 text-white mr-3" />
              <span className="text-white font-semibold text-lg">Hinge Health</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <DropdownMenu open={openDropdown === "dashboards"} onOpenChange={(open) => setOpenDropdown(open ? "dashboards" : null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium">
                    <ChartLine className="h-4 w-4 mr-2" />
                    Dashboards
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Security Overview</DropdownMenuItem>
                  <DropdownMenuItem>Risk Assessment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium bg-blue-800">
                <Box className="h-4 w-4 mr-2" />
                Applications
              </Button>
              
              <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium">
                <Folder className="h-4 w-4 mr-2" />
                Projects
              </Button>
              
              <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium">
                <Bug className="h-4 w-4 mr-2" />
                Findings
              </Button>
              
              <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium">
                <BarChart className="h-4 w-4 mr-2" />
                Reports
              </Button>
              
              <Button variant="ghost" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium">
                <Cog className="h-4 w-4 mr-2" />
                Workflows
              </Button>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" className="text-white hover:text-gray-200 p-2">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:text-gray-200 p-2 ml-2">
              <Settings className="h-5 w-5" />
            </Button>
            
            <DropdownMenu open={openDropdown === "user"} onOpenChange={(open) => setOpenDropdown(open ? "user" : null)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-gray-200 ml-3 text-sm font-medium">
                  <User className="h-4 w-4 mr-2" />
                  tanishq.bhatnagar
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
