import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X,
  Users, 
  Package, 
  Truck, 
  Shield, 
  BarChart3,
  Search,
  Bell,
  Barcode
} from 'lucide-react';
import Logo from '../components/logo';
import { useAuth } from '../context/authContext';
import Button from '../components/button';
import { getAccessibleMenuItems } from '../utils/roleUtils';
import OverviewPanel from '../components/panels/OverviewPanel';
import AssetsPanel from '../components/panels/AssetsPanel';
import UsersPanel from '../components/panels/UsersPanel';
// import DevicesPanel from '../components/panels/DevicesPanel';
import SuppliersPanel from '../components/panels/SuppliersPanel';
import InsurancePanel from '../components/panels/InsurancePanel';
import QRScannerPanel from '../components/panels/QRScannerPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      // Reset search visibility on larger screens
      if (window.innerWidth >= 768) {
        setIsSearchVisible(true);
      } else {
        setIsSearchVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Map backend role names to our UserRole type
  const mapRoleToUserRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'superadmin': 'superadmin',
      'super_admin': 'superadmin',
      'administrator': 'superadmin',
      'admin': 'admin',
      'manager': 'admin',
      'user': 'user',
      'employee': 'user',
      'staff': 'user'
    };
    return roleMap[role.toLowerCase()] || 'user';
  };

  // Get accessible menu items based on user role
  const accessibleMenuItems = user ? getAccessibleMenuItems(mapRoleToUserRole(user.role) as any) : [];
  
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'qr-scanner', label: 'QR Code Scanner', icon: Barcode },
  ].filter(item => accessibleMenuItems.some(accessible => accessible.id === item.id));

  const renderPanel = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPanel />;
      case 'assets':
        return <AssetsPanel />;
      case 'users':
        return <UsersPanel />;
      case 'suppliers':
        return <SuppliersPanel />;
      case 'insurance':
        return <InsurancePanel />;
       case 'qr-scanner':
        return <QRScannerPanel />;
      default:
        return <OverviewPanel />;
        
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-lg z-50 transition-transform duration-300 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:shadow-none lg:z-10`}>
        
        <div className="p-4 flex items-center justify-between border-b border-slate-100 lg:p-6">
          <Logo className="h-20 w-20 lg:h-28 lg:w-28" />
          <button 
            className="p-2 rounded-lg hover:bg-slate-100 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-2 px-2 lg:mt-6 lg:px-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 lg:rounded-none lg:px-6 ${
                activeSection === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className="mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Mobile Only Logout */}
        <div className="mt-auto p-4 border-t border-slate-100 lg:hidden">
          <Button 
            variant="outline" 
            className="w-full border-slate-200 hover:bg-slate-50"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              
              {/* Page Title - Mobile Only */}
              <h1 className="text-lg font-medium text-slate-800 lg:hidden">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button - Mobile Only */}
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>
              
              {/* Search Input - Always Visible on Tablet+ */}
              <div className={`${isSearchVisible ? 'flex' : 'hidden'} absolute top-full left-0 w-full p-3 bg-white border-b border-slate-200 md:static md:block md:border-0 md:p-0 md:w-auto transition-all duration-200`}>
                <div className="relative w-full md:w-[300px] lg:w-[400px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
              </div>
              
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Info & Logout - Desktop Only */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-slate-200 hover:bg-slate-50 hidden lg:inline-flex"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
          
          {/* Active Section Title - Desktop Only */}
          <div className="hidden lg:block px-6 py-2 border-b border-slate-100">
            <h1 className="text-xl font-medium text-slate-800">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;