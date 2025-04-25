import CalculatorForm from "@/components/CalculatorForm";

export default function Home() {
  return (
    <main className="container py-8 flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Du Brut au Net</h1>
        <p className="text-muted-foreground">
          Convertissez rapidement vos salaires bruts en nets, et vice-versa
        </p>
      </div>

      <CalculatorForm />

      {/* TODO: Afficher les résultats une fois le formulaire soumis */}
      {/* <ResultsGrid results={results} /> */}
      {/* <ChargeBreakdown charges={results.details} montantBrut={results.brut.monthly} /> */}
    </main>
  );
}
