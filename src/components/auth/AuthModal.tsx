import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";
import { MentorOnboardingModal } from "@/components/auth/MentorOnboardingModal";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export const AuthModal = ({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [mentorWizardOpen, setMentorWizardOpen] = useState(false);
  const [mentorInitData, setMentorInitData] = useState<{
    name?: string;
    email?: string;
    password?: string;
    batch?: string;
  }>({});

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"student" | "alumni">("student");
  const [regMajor, setRegMajor] = useState("Computer Science");
  const [regBatch, setRegBatch] = useState("2025");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegRole("student");
    setRegMajor("Computer Science");
    setRegBatch("2025");
  };

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      resetForm();
    }
  }, [open, defaultTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Welcome back to Andhra University Alma.Net!");
      resetForm();
      onOpenChange(false);
    } else {
      toast.error(res.message || "Invalid email or password");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (regRole === "alumni") {
      setMentorInitData({
        name: regName,
        email: regEmail,
        password: regPassword,
        batch: regBatch,
      });
      resetForm();
      onOpenChange(false);
      setMentorWizardOpen(true);
      return;
    }

    setLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      major: regMajor,
      batch: Number(regBatch),
    });
    setLoading(false);
    if (res.success) {
      toast.success("Account created! You are now logged in.");
      resetForm();
      onOpenChange(false);
    } else {
      toast.error(res.message || "Registration failed");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {tab === "login" ? "Sign in to Alma.Net" : "Join the AU Network"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab switch */}
          <div className="flex rounded-lg bg-secondary/60 p-1 mt-2">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                resetForm();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-smooth flex items-center justify-center gap-1.5 ${
                tab === "login" ? "bg-background text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                resetForm();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-smooth flex items-center justify-center gap-1.5 ${
                tab === "register" ? "bg-background text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Create Account
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} autoComplete="off" className="space-y-3.5 mt-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">University Email</label>
                <Input
                  type="email"
                  placeholder="name@andhrauniv.edu.in"
                  className="mt-1"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button variant="hero" type="submit" className="w-full mt-2" disabled={loading}>
                <LogIn className="h-4 w-4 mr-1.5" /> {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off" className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                <Input
                  placeholder="Your full name"
                  className="mt-1"
                  autoComplete="off"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  placeholder="name@andhrauniv.edu.in"
                  className="mt-1"
                  autoComplete="off"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password *</label>
                <Input
                  type="password"
                  placeholder="Create password"
                  className="mt-1"
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as "student" | "alumni")}
                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumnus/Mentor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Batch</label>
                  <Input
                    placeholder="2025"
                    className="mt-1"
                    value={regBatch}
                    onChange={(e) => setRegBatch(e.target.value)}
                  />
                </div>
              </div>

              <Button variant="hero" type="submit" className="w-full mt-2" disabled={loading}>
                <UserPlus className="h-4 w-4 mr-1.5" /> {loading ? "Creating..." : regRole === "alumni" ? "Continue to Mentor Setup" : "Create Account"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <MentorOnboardingModal
        open={mentorWizardOpen}
        onOpenChange={setMentorWizardOpen}
        initialData={mentorInitData}
        onSuccess={() => {
          setMentorWizardOpen(false);
        }}
      />
    </>
  );
};

