import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Filter, Users, Package, Activity } from 'lucide-react';
import CopilotWidget from './CopilotWidget';

const Sidebar = () => {
  const navItems = [
    { name: 'Executive', path: '/executive', icon: <LayoutDashboard size={20} /> },
    { name: 'Funnel', path: '/funnel', icon: <Filter size={20} /> },
    { name: 'Customer', path: '/customer', icon: <Users size={20} /> },
    { name: 'Product', path: '/product', icon: <Package size={20} /> },
  ];

  return (
    <div className="w-64 bg-surface border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">InsightFlow</span>
      </div>
      
      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 px-2">Navigation</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="glass-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Database Connected
          </div>
          <p className="text-xs text-muted">PostgreSQL via Neon</p>
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-white/10 bg-surface/50 backdrop-blur flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-white/90">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              IF
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CopilotWidget />
    </div>
  );
};

export default Layout;
