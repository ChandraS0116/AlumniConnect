import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  accent?: boolean;
  className?: string;
}

export const StatCard = ({ icon: Icon, label, value, trend, accent, className }: StatCardProps) => (
  <Card className={cn(
    "p-6 bg-card-gradient border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth group relative overflow-hidden",
    className
  )}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-gradient opacity-0 group-hover:opacity-10 rounded-full blur-2xl -translate-y-8 translate-x-8 transition-smooth" />
    <div className="flex items-start justify-between relative">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{label}</div>
        <div className="font-serif text-4xl font-bold mt-2 text-primary">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {trend && <div className="text-xs text-accent mt-1.5 font-medium">{trend}</div>}
      </div>
      <div className={cn(
        "h-11 w-11 rounded-xl flex items-center justify-center",
        accent ? "bg-gold-gradient shadow-gold" : "bg-secondary"
      )}>
        <Icon className={cn("h-5 w-5", accent ? "text-primary" : "text-primary")} />
      </div>
    </div>
  </Card>
);
