import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { labEntryFormSchema, type LabEntryFormValues } from "@/features/lab-analysis/schemas";

const defaultValues: LabEntryFormValues = {
  patientContext: {
    age: undefined,
    sex: "unknown"
  },
  results: [
    {
      testName: "Hemoglobin",
      value: 11.2,
      unit: "g/dL",
      referenceRange: { low: 12, high: 16 },
      notes: ""
    }
  ]
};

export function LabEntryForm({ onSubmit, isSubmitting }: { onSubmit: (values: LabEntryFormValues) => void; isSubmitting?: boolean }) {
  const form = useForm<LabEntryFormValues>({
    resolver: zodResolver(labEntryFormSchema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "results"
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Optional patient context</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" placeholder="35" {...form.register("patientContext.age", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <select
              id="sex"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              {...form.register("patientContext.sex")}
            >
              <option value="unknown">Prefer not to say / Unknown</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Lab result {index + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2 md:col-span-2">
                <Label>Test name</Label>
                <Input placeholder="A1C" {...form.register(`results.${index}.testName`)} />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" step="any" placeholder="6.1" {...form.register(`results.${index}.value`, { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input placeholder="%" {...form.register(`results.${index}.unit`)} />
              </div>
              <div className="grid grid-cols-2 gap-3 md:col-span-5">
                <div className="space-y-2">
                  <Label>Reference low</Label>
                  <Input type="number" step="any" placeholder="4.0" {...form.register(`results.${index}.referenceRange.low`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Reference high</Label>
                  <Input type="number" step="any" placeholder="5.6" {...form.register(`results.${index}.referenceRange.high`, { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-5">
                <Label>Notes</Label>
                <Textarea placeholder="Optional context from report, such as fasting status or abnormal flag" {...form.register(`results.${index}.notes`)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ testName: "", value: 0, unit: "", referenceRange: {}, notes: "" })}
        >
          <Plus className="h-4 w-4" /> Add another lab
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Analyzing..." : "Analyze results"}
        </Button>
      </div>
    </form>
  );
}
