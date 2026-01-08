import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-4 md:p-6 rounded-lg bg-accent/50 border border-border text-center",
        className
      )}
    >
      <span className="text-2xl md:text-3xl font-bold text-primary font-serif">
        {value}
      </span>
      <span className="text-sm md:text-base text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}
