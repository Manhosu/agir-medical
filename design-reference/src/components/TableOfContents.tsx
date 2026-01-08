import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Índice
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className="text-left w-full text-sm text-foreground/80 hover:text-primary transition-colors py-1.5 px-3 rounded-md hover:bg-accent/50"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
