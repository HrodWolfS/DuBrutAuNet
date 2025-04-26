import CalculatorForm from "@/components/CalculatorForm";

export default function Home() {
  return (
    <main className="container py-8 flex flex-col items-center gap-8">
      <CalculatorForm />

      {/* TODO: Afficher les résultats une fois le formulaire soumis */}
      {/* <ResultsGrid results={results} /> */}
      {/* <ChargeBreakdown charges={results.details} montantBrut={results.brut.monthly} /> */}
    </main>
  );
}
