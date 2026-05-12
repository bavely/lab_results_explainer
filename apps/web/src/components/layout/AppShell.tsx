import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Activity, Github } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-600 text-white">
              <Activity className="h-5 w-5" />
            </span>
            <span>Lab Results Explainer</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavItem to="/manual">Manual Entry</NavItem>
            <NavItem to="/upload">Upload PDF</NavItem>
            <a
              href="https://github.com/your-username/lab-results-explainer"
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          Educational demo only. Not medical advice, diagnosis, or treatment.
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium ${
          isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
