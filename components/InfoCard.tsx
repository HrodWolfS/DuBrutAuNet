import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card
      className="rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
      style={{
        boxShadow:
          "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
      }}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
