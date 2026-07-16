import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Filter, Users, Package, Activity, ArrowLeft } from 'lucide-react';
import CopilotWidget from './CopilotWidget';

const Sidebar = () => {
  const navItems = [
    { name: 'Executive', path: '/app/executive', icon: <LayoutDashboard size={18} /> },
    { name: 'Funnel', path: '/app/funnel', icon: <Filter size={18} /> },
    { name: 'Customer', path: '/app/customer', icon: <Users size={18} /> },
    { name: 'Product', path: '/app/product', icon: <Package size={18} /> },
  ];

  return (
    <div className="w-60 border-r border-white/[0.07] h-screen fixed left-0 top-0 flex flex-col"
      style={{ background: '#0f0f1a' }}>
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            <Activity size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">InsightFlow</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="px-3 py-4 flex-1">
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest mb-3 px-2">Analytics</p>
        <nav className="flex flex-col gap-0.5" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-primary/15 text-primary-light font-medium border border-primary/20'
                    : 'text-muted hover:bg-white/[0.04] hover:text-white/80 border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Back to site */}
      <div className="p-3 border-t border-white/[0.06]">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-white hover:bg-white/[0.04] transition-all duration-200"
        >
          <ArrowLeft size={13} />
          Back to site
        </Link>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a', color: '#f1f5f9' }}>
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-white/[0.06] sticky top-0 z-10 flex items-center justify-between px-6"
          style={{ background: 'rgba(15,15,26,0.8)', backdropFilter: 'blur(12px)' }}>
          <h2 className="text-sm font-semibold text-white/70">Analytics Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              IF
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CopilotWidget />
    </div>
  );
};

export default Layout;
