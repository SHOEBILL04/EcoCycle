import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Camera,
  Trophy,
  Activity,
  User,
  Gift,
  Settings,
  Shield,


  LogOut,
  Leaf,
  Menu,
  X,
  Bell,
  ChevronDown,
  Recycle,
} from "lucide-react";

const baseNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { label: "Submit Waste", icon: Camera, path: "/app/submit" },
  { label: "Leaderboard", icon: Trophy, path: "/app/leaderboard" },
  { label: "Activity Feed", icon: Activity, path: "/app/feed" },
  { label: "My Profile", icon: User, path: "/app/profile" },
  { label: "Rewards", icon: Gift, path: "/app/rewards" },
  { label: "Settings", icon: Settings, path: "/app/settings" },
];



// User roles for type safety
type UserRole = "Citizen" | "Moderator" | "Administrator";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("Citizen");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/user', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
          setUser(data);
          const normalizedRole = String(data.role ?? 'citizen').toLowerCase();
          localStorage.setItem('role', normalizedRole);
          localStorage.setItem('user_email', data.email ?? '');
          const roleText: UserRole =
            normalizedRole === 'admin'
              ? 'Administrator'
              : normalizedRole === 'moderator'
                ? 'Moderator'
                : 'Citizen';
          setCurrentRole(roleText);
        }
    })
    .catch(console.error);

    fetch('http://localhost:8000/api/notifications', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        const list = data.notifications || [];
        setNotifications(list);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : list.filter((n: any) => !n.is_read).length);
    })
    .catch(console.error);
  }, []);

  const markNotificationRead = async (notificationId: number) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        }
      });

      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const isAdmin =
    (user?.email ?? localStorage.getItem('user_email') ?? '').toLowerCase() === 'rockstar@gmail.com' ||
    (localStorage.getItem('role') ?? '').toLowerCase() === 'admin';

  const navItems = isAdmin
    ? [...baseNavItems, { label: "Admin Dashboard", icon: Shield, path: "/app/admin" }]
    : baseNavItems;

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ item }: { item: { label: string; icon: any; path: string } }) => (
    <Link
      to={item.path}
      onClick={() => setMobileSidebarOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive(item.path)
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
          : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <item.icon
        className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? "text-white" : "text-emerald-400 group-hover:text-white"}`}
      />
      {(sidebarOpen || mobileSidebarOpen) && (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
          <Recycle className="w-5 h-5 text-white" />
        </div>
        {(sidebarOpen || mobileSidebarOpen) && (
          <div>
            <h1 className="text-white font-bold text-lg leading-none">
              EcoCycle
            </h1>
            <p className="text-emerald-400 text-xs">Waste Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p
          className={`text-emerald-500/50 text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${!sidebarOpen && !mobileSidebarOpen ? "hidden" : ""}`}
        >
          Main Menu
        </p>
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}


      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/10">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors ${!sidebarOpen && !mobileSidebarOpen ? "justify-center" : ""}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          {(sidebarOpen || mobileSidebarOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-emerald-400 text-xs truncate">{currentRole}</p>
            </div>
          )}
          {(sidebarOpen || mobileSidebarOpen) && (
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="text-emerald-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-64" : "w-16"}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                window.innerWidth >= 1024
                  ? setSidebarOpen(!sidebarOpen)
                  : setMobileSidebarOpen(true)
              }
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-emerald-600">{user?.total_points?.toLocaleString() || 0}</span>{" "}
                eco points
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id).catch(console.error)}
                        className={`w-full text-left flex gap-3 p-3 hover:bg-gray-50 cursor-pointer ${n.is_read ? 'bg-white' : 'bg-emerald-50/40'}`}
                      >
                        <span className="text-xl">{n.type === 'dispute_raised' ? '⚠️' : '✅'}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2">
                  <Link
                    to="/app/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Your Profile
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                        setProfileOpen(false);
                        localStorage.clear();
                        navigate('/');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
