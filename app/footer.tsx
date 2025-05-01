export function Footer() {
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(currentDate);

  return (
    <footer className="p-3 sm:p-4 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground space-y-2 md:space-y-0">
        <div className="text-center md:text-left">
          <span>
            Taux mis à jour le : <strong>{formattedDate}</strong>
          </span>
          <span className="hidden md:inline"> | </span>
          <span className="block md:inline">
            © {currentDate.getFullYear()} Du Brut au Net
          </span>
        </div>
        <span className="text-center md:text-right text-[10px] sm:text-xs">
          Données fournies à titre indicatif et sans garantie.
        </span>
      </div>
    </footer>
  );
}
