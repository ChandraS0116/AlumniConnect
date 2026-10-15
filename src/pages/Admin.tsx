import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { stats as defaultStats, alumniData, doubtsData } from "@/data/mockData";
import { Users, GraduationCap, Video, AlertCircle, CheckCircle2, TrendingUp, Activity, Shield, MoreHorizontal, XCircle } from "lucide-react";
import { getStats, getPendingApprovals, approvePending, rejectPending } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface PendingItem {
  id: string;
  name: string;
  type: string;
  action: string;
  time: string;
}

const Admin = () => {
  const { user, isAdmin, login } = useAuth();
  const [adminStats, setAdminStats] = useState<typeof defaultStats & { pendingApprovals?: number }>(defaultStats);
  const [pendingList, setPendingList] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [s, p] = await Promise.all([getStats(), getPendingApprovals()]);
    setAdminStats(s);
    setPendingList(p);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    const res = await approvePending(id);
    if (res.success) {
      toast.success(`Approved ${name}`);
      setPendingList((prev) => prev.filter((item) => item.id !== id));
      setAdminStats((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, (prev.pendingApprovals ?? pendingList.length) - 1),
      }));
    }
  };

  const handleReject = async (id: string, name: string) => {
    const res = await rejectPending(id);
    if (res.success) {
      toast.info(`Rejected item for ${name}`);
      setPendingList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-24 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold mb-6">
          <Shield className="h-8 w-8 text-primary" strokeWidth={2.5} />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">Admin Access Required</h1>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          The AU Operations Console is restricted to authorized faculty and administrative deans.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button
            variant="hero"
            size="lg"
            onClick={async () => {
              const res = await login("admin@andhrauniv.edu.in", "admin123");
              if (res.success) toast.success("Authenticated as AU Dean of Alumni Relations");
            }}
          >
            <Shield className="h-4 w-4 mr-2" /> Sign in as AU Dean
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Admin Console</span>
          </div>
          <h1 className="font-serif text-5xl font-bold text-primary mt-2">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back. Here's what needs your attention today.</p>
        </div>
        <Badge className="bg-gold-gradient text-primary border-0 px-3 py-1.5 font-semibold">
          <Activity className="h-3.5 w-3.5 mr-1.5" /> All systems healthy
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <StatCard icon={Users} label="Total Alumni" value={adminStats.alumni} trend="↑ 124 this week" accent />
        <StatCard icon={GraduationCap} label="Active Students" value={adminStats.students} trend="↑ 38 this week" />
        <StatCard icon={Video} label="Mentor Videos" value={adminStats.videos} trend="↑ 12 this week" />
        <StatCard icon={AlertCircle} label="Pending Approvals" value={pendingList.length} trend="Live queue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        {/* Pending */}
        <Card className="lg:col-span-2 p-6 bg-card border-border/60 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl font-bold text-primary">Pending Approvals</h2>
            <Badge variant="secondary">{pendingList.length}</Badge>
          </div>
          {pendingList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2 opacity-80" />
              All approvals cleared! No pending requests.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {pendingList.map((p) => (
                <div key={p.id || p.name} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center text-primary font-serif font-bold text-sm shrink-0">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.action}</div>
                  </div>
                  <Badge variant="outline" className="hidden sm:inline-flex">{p.type}</Badge>
                  <span className="text-xs text-muted-foreground hidden md:block">{p.time}</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="hero" onClick={() => handleApprove(p.id, p.name)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleReject(p.id, p.name)}>
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Engagement chart */}
        <Card className="p-6 bg-primary text-primary-foreground border-0 shadow-elegant relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold-gradient opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> Weekly Engagement
            </div>
            <div className="font-serif text-5xl font-bold mt-3">+18.4%</div>
            <p className="text-primary-foreground/70 text-sm mt-1">vs. previous week</p>

            <div className="flex items-end gap-2 h-36 mt-8 pt-4">
              {[40, 55, 38, 70, 62, 88, 95].map((h, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gold-gradient shadow-gold transition-smooth hover:opacity-90"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[11px] font-semibold text-primary-foreground/80">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 bg-card border-border/60 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-primary mb-4">Top Alumni This Month</h2>
          <div className="space-y-3">
            {alumniData.slice(0, 5).map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="font-serif font-bold text-accent text-lg w-6">{i + 1}</div>
                <img src={a.avatar} alt={a.name} className="h-9 w-9 rounded-full bg-secondary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.role} · {a.company}</div>
                </div>
                <Badge variant="secondary" className="text-xs">{(i + 1) * 38 + 42} views</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border/60 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-primary mb-4">Recent Doubts</h2>
          <div className="space-y-4">
            {doubtsData.slice(0, 4).map((d) => (
              <div key={d.id} className="text-sm">
                <p className="text-foreground line-clamp-1">{d.question}</p>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>{d.student}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{d.topic}</Badge>
                  <span>{d.postedAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
