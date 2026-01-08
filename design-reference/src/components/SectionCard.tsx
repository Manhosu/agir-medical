import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionCard({ title, icon: Icon, children, className, id }: SectionCardProps) {
  return (
    <section 
      id={id}
      className={cn(
        "bg-card rounded-lg border border-border p-6 md:p-8 shadow-md transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-semibold text-foreground font-serif">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-foreground/90">
        {children}
      </div>
    </section>
  );
}
