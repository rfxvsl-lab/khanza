import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, CalendarDays, Car, MessageSquare, HelpCircle, LogOut, Settings, Home, Mail, Tag, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLayout() {
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const { site_name } = useSettings();

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const navItems = [
    { name: 'Dasbor', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Konten Beranda', path: '/admin/content-home', icon: <Home size={20} /> },
    { name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Layanan', path: '/admin/services', icon: <Wrench size={20} /> },
    { name: 'Reservasi', path: '/admin/bookings', icon: <CalendarDays size={20} /> },
    { name: 'Galeri', path: '/admin/garage', icon: <Car size={20} /> },
    { name: 'Testimoni', path: '/admin/testimonials', icon: <MessageSquare size={20} /> },
    { name: 'FAQ', path: '/admin/faqs', icon: <HelpCircle size={20} /> },
    { name: 'Newsletter', path: '/admin/newsletters', icon: <Mail size={20} /> },
    { name: 'Voucher', path: '/admin/vouchers', icon: <Tag size={20} /> },
    { name: 'Invoice', path: '/admin/invoices', icon: <FileText size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex selection:bg-red-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white truncate">{site_name} <span className="text-red-500 text-sm">Admin</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}