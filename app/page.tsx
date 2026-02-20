import CalculatorForm from "@/components/CalculatorForm";
import { LatestArticles } from "@/components/LatestArticles";
import { getAllPosts } from "@/lib/blog";

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <main className="container flex-1 py-8 flex flex-col items-center justify-center gap-8">
      <CalculatorForm />
      <LatestArticles posts={latestPosts} />
    </main>
  );
}
