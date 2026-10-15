import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Users, Video, Shield, LayoutDashboard, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alumni", label: "Alumni", icon: Users },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/mentors", label: "Mentors", icon: Video },
  { to: "/admin", label: "Admin", icon: Shield },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold group-hover:scale-110 transition-smooth">
                <GraduationCap className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
            </div>
            <div className="leading-tight">
              <div className="font-serif font-bold text-lg text-primary">AU Alma<span className="text-gold">.</span>Net</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Andhra University</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-smooth",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 pl-2">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full bg-secondary ring-1 ring-accent/30"
                  />
                  <div className="text-left text-xs leading-none">
                    <div className="font-semibold text-foreground truncate max-w-[120px]">{user.name.split(" ")[0]}</div>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase mt-0.5 border-accent text-accent font-mono">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-xs h-8 text-muted-foreground hover:text-destructive">
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Exit
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>Sign in</Button>
                <Button variant="hero" size="sm" onClick={() => openAuth("register")}>Join Network</Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background animate-fade-up">
            <nav className="container py-3 flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3",
                    pathname === to ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2 border-t border-border/60 mt-1">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full bg-secondary" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setOpen(false); openAuth("login"); }}>Sign in</Button>
                    <Button variant="hero" size="sm" className="flex-1" onClick={() => { setOpen(false); openAuth("register"); }}>Join</Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </>
  );
};
