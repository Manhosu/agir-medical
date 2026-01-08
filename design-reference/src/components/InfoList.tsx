import { cn } from "@/lib/utils";

interface InfoListProps {
  items: string[];
  className?: string;
  variant?: "default" | "highlight" | "numbered";
}

export function InfoList({ items, className, variant = "default" }: InfoListProps) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <li 
          key={index} 
          className={cn(
            "flex items-start gap-3 text-foreground/90",
            variant === "highlight" && "bg-accent/50 p-3 rounded-md"
          )}
        >
          {variant === "numbered" ? (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
              {index + 1}
            </span>
          ) : (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
