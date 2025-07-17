import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  Server,
  BarChart,
  AlertTriangle,
  TrendingUp,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import HingeLogo from "./hinge-logo";
import hingeHealthLogoPath from "@assets/ChatGPT Image Jul 17, 2025, 07_08_44 PM_1752760077600.png";

interface NavigationProps {
  onLogout: () => void;
  currentPage?: string;
}

export default function Navigation({ onLogout, currentPage }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [location] = useLocation();
  
  // Determine current page from URL if not explicitly provided
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (location.includes('/services')) return 'services';
    if (location.includes('/dashboards')) return 'dashboards';
    if (location.includes('/reports')) return 'reports';
    if (location.includes('/alerts')) return 'alerts';
    if (location.includes('/risk-scoring')) return 'risk-scoring';
    return 'services'; // default
  };
  
  const activePage = getCurrentPage();

  return (
    <nav className="bg-primary shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={hingeHealthLogoPath} 
                alt="Hinge Health Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/dashboards">
                <Button 
                  variant="ghost" 
                  className={`text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${activePage === 'dashboards' ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-green-800'}`}
                >
                  <ChartLine className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/services">
                <Button 
                  variant="ghost" 
                  className={`text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${activePage === 'services' ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-green-800'}`}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Services
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button 
                  variant="ghost" 
                  className={`text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${activePage === 'reports' ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-green-800'}`}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              
              <Link href="/alerts">
                <Button 
                  variant="ghost" 
                  className={`text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${activePage === 'alerts' ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-green-800'}`}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alerts
                </Button>
              </Link>

              <Link href="/risk-scoring">
                <Button 
                  variant="ghost" 
                  className={`text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${activePage === 'risk-scoring' ? 'bg-green-700 hover:bg-green-600' : 'hover:bg-green-800'}`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Risk Scoring
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" className="text-white hover:text-gray-200 p-2 transition-all duration-200 hover:scale-110 hover:bg-green-800">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:text-gray-200 p-2 ml-2 transition-all duration-200 hover:scale-110 hover:bg-green-800">
              <Settings className="h-5 w-5" />
            </Button>
            
            <DropdownMenu open={openDropdown === "user"} onOpenChange={(open) => setOpenDropdown(open ? "user" : null)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-gray-200 ml-3 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-green-800">
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
