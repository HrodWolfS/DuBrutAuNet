export function Footer() {
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(currentDate);

  return (
    <footer className="p-3 sm:p-4 border-t border-border mt-auto">
      <div className="relative max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Taux mis à jour le : <strong>{formattedDate}</strong>
        </span>
        <span
          className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent font-bold text-center whitespace-nowrap"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          © {currentDate.getFullYear()} Du Brut au Net
        </span>
        <span className="text-[10px] sm:text-xs text-right">
          Données fournies à titre indicatif et sans garantie.
        </span>
      </div>
    </footer>
  );
}
