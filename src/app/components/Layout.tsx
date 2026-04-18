import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  FileText,
  Settings as SettingsIcon,
  Hospital,
} from "lucide-react";

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/patients", label: "Patients", icon: Users },
    { path: "/doctors", label: "Doctors", icon: UserCog },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/billing", label: "Billing", icon: FileText },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#f8fafc",
          padding: "20px",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>MediCare</h2>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  color: active ? "#2563eb" : "#374151",
                  background: active ? "#e0f2fe" : "transparent",
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px", background: "#f1f5f9" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;