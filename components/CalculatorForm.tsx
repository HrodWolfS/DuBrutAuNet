"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCalculator } from "@/lib/hooks/useCalculator";
import { formSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChargeBreakdown } from "./ChargeBreakdown";

export default function CalculatorForm() {
  const [
    { values, status, taxRate, workPercent, hoursPerWeek, prime },
    { handleValueChange, setStatus, setTaxRate, setWorkPercent, setPrime },
  ] = useCalculator();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 11.65,
      unit: "hourly",
      direction: "brut",
      status: "CDI",
      hoursPerWeek: 35,
    },
  });

  // Formater un nombre pour l'affichage
  const formatNumber = (num: number | string) => {
    if (typeof num === "string") {
      if (num === "" || isNaN(Number(num))) return "0,00";
      return Number(num).toLocaleString("fr-FR", { minimumFractionDigits: 2 });
    }
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 2 });
  };

  // Période active
  const activePeriod = form.watch("unit") as
    | "hourly"
    | "daily"
    | "monthly"
    | "yearly";
  const activeDirection = form.watch("direction") as "brut" | "net";

  // Réinitialiser le formulaire avec les valeurs par défaut
  const resetForm = () => {
    form.reset({
      amount: 11.65,
      unit: "hourly",
      direction: "brut",
      status: "CDI",
      hoursPerWeek: 35,
    });
    handleValueChange("11.65", "hourly", "brut");
    setStatus("CDI");
    setWorkPercent(100);
    setTaxRate(14);
    setPrime(0);
  };

  // Gérer les changements de valeur en fonction de la direction
  const handleValueInput = (value: string) => {
    const direction = form.getValues("direction");
    const period = form.getValues("unit");
    handleValueChange(value, period, direction);
  };

  // Synchroniser le status et hoursPerWeek avec le hook
  useEffect(() => {
    setStatus(form.getValues("status"));
  }, [form.watch("status"), setStatus]);

  useEffect(() => {
    setWorkPercent((form.getValues("hoursPerWeek") / 35) * 100);
  }, [form.watch("hoursPerWeek"), setWorkPercent]);

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informations salariales</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="flex flex-col gap-4">
                  {/* Direction: Brut ou Net */}
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={(value) => {
                              if (value) {
                                field.onChange(value);
                                const amount = form.getValues("amount");
                                const unit = form.getValues("unit");
                                handleValueChange(
                                  amount.toString(),
                                  unit,
                                  value as "brut" | "net"
                                );
                              }
                            }}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="brut">Brut</ToggleGroupItem>
                            <ToggleGroupItem value="net">Net</ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Montant */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={
                              activeDirection === "brut"
                                ? values.brut[activePeriod].toString()
                                : values.net[activePeriod].toString()
                            }
                            onChange={(e) => {
                              field.onChange(
                                parseFloat(e.target.value.replace(/,/g, ".")) ||
                                  0
                              );
                              handleValueInput(e.target.value);
                            }}
                            className="text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Période */}
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Période</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={(value) => {
                              if (value) {
                                field.onChange(value);
                                const amount = form.getValues("amount");
                                const direction = form.getValues("direction");
                                handleValueChange(
                                  amount.toString(),
                                  value as
                                    | "hourly"
                                    | "daily"
                                    | "monthly"
                                    | "yearly",
                                  direction as "brut" | "net"
                                );
                              }
                            }}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="hourly">
                              Horaire
                            </ToggleGroupItem>
                            <ToggleGroupItem value="daily">
                              Journalier
                            </ToggleGroupItem>
                            <ToggleGroupItem value="monthly">
                              Mensuel
                            </ToggleGroupItem>
                            <ToggleGroupItem value="yearly">
                              Annuel
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="CDI">CDI</SelectItem>
                              <SelectItem value="CDD">CDD</SelectItem>
                              <SelectItem value="FONCTION_PUBLIQUE">
                                Fonction Publique
                              </SelectItem>
                              <SelectItem value="ALTERNANCE">
                                Alternance
                              </SelectItem>
                              <SelectItem value="AUTO_ENTREPRENEUR">
                                Auto-Entrepreneur
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Heures par semaine */}
                  <FormField
                    control={form.control}
                    name="hoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heures par semaine</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            min={1}
                            max={50}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Impôt sur le revenu */}
                  <div className="flex flex-col gap-2">
                    <FormLabel>Impôt sur le revenu (%)</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      max={45}
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Prime exceptionnelle */}
                  <div className="flex flex-col gap-2">
                    <FormLabel>Prime annuelle (€)</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      value={prime}
                      onChange={(e) => setPrime(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Bouton reset */}
                  <Button variant="outline" onClick={resetForm}>
                    Réinitialiser
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carte des salaires bruts */}
            <Card>
              <CardHeader>
                <CardTitle>Salaire Brut</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Horaire :</div>
                  <div>{formatNumber(values.brut.hourly)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Journalier :</div>
                  <div>{formatNumber(values.brut.daily)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Mensuel :</div>
                  <div>{formatNumber(values.brut.monthly)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Annuel :</div>
                  <div>{formatNumber(values.brut.yearly)} €</div>
                </div>
              </CardContent>
            </Card>

            {/* Carte des salaires nets */}
            <Card>
              <CardHeader>
                <CardTitle>Salaire Net</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Horaire :</div>
                  <div>{formatNumber(values.net.hourly)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Journalier :</div>
                  <div>{formatNumber(values.net.daily)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Mensuel :</div>
                  <div>{formatNumber(values.net.monthly)} €</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Annuel :</div>
                  <div>{formatNumber(values.net.yearly)} €</div>
                </div>
              </CardContent>
            </Card>

            {/* Détail des charges */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Charges salariales</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mensuel">
                  <TabsList className="mb-4">
                    <TabsTrigger value="mensuel">Mensuel</TabsTrigger>
                    <TabsTrigger value="annuel">Annuel</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mensuel">
                    <ScrollArea className="h-[200px]">
                      <ChargeBreakdown
                        brutAmount={Number(values.brut.monthly)}
                        status={status}
                        taxRate={taxRate}
                      />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="annuel">
                    <ScrollArea className="h-[200px]">
                      <ChargeBreakdown
                        brutAmount={Number(values.brut.yearly)}
                        status={status}
                        taxRate={taxRate}
                      />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
