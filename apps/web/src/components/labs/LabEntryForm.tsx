import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyzeRequest } from "@/types/labs";

const labRowSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  value: z.coerce.number({ invalid_type_error: "Value is required" }),
  unit: z.string().optional(),
  referenceRange: z.object({
    low: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().optional()),
    high: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().optional()),
  }),
  notes: z.string().optional(),
  source: z.literal("manual").default("manual"),
});

const formSchema = z.object({
  patientContext: z.object({
    age: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().min(0).max(130).optional()),
    sex: z.enum(["male", "female", "other", "unknown"]).default("unknown"),
    pregnant: z.boolean().optional(),
  }),
  results: z.array(labRowSchema).min(1),
});

type LabEntryFormValues = z.infer<typeof formSchema>;

const defaultValues: LabEntryFormValues = {
  patientContext: { age: undefined, sex: "unknown", pregnant: false },
  results: [
    {
      testName: "Hemoglobin",
      value: 11.2,
      unit: "g/dL",
      referenceRange: { low: 12, high: 16 },
      notes: "",
      source: "manual",
    },
  ],
};

interface LabEntryFormProps {
  onSubmit: (data: AnalyzeRequest) => void;
  isSubmitting?: boolean;
}

export function LabEntryForm({ onSubmit, isSubmitting }: LabEntryFormProps) {
  const form = useForm<LabEntryFormValues>({ resolver: zodResolver(formSchema), defaultValues });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "results" });

  function submit(values: LabEntryFormValues) {
    const payload: AnalyzeRequest = {
      patientContext: {
        age: values.patientContext.age === undefined ? undefined : Number(values.patientContext.age),
        sex: values.patientContext.sex,
        pregnant: Boolean(values.patientContext.pregnant),
      },
      results: values.results.map((item) => ({
        testName: item.testName,
        value: Number(item.value),
        unit: item.unit || undefined,
        referenceRange: {
          low: item.referenceRange.low === undefined ? undefined : Number(item.referenceRange.low),
          high: item.referenceRange.high === undefined ? undefined : Number(item.referenceRange.high),
        },
        notes: item.notes,
        source: "manual",
      })),
    };
    onSubmit(payload);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual lab entry</CardTitle>
        <CardDescription>Enter values exactly as shown on your lab report, including the lab's reference range.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" placeholder="Optional" {...form.register("patientContext.age")} />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("patientContext.sex")}>
                <option value="unknown">Unknown / prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" className="h-4 w-4" {...form.register("patientContext.pregnant")} /> Pregnant
            </label>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Lab result #{index + 1}</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Test name</Label>
                    <Input placeholder="A1C, LDL, TSH..." {...form.register(`results.${index}.testName`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input type="number" step="any" {...form.register(`results.${index}.value`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input placeholder="mg/dL" {...form.register(`results.${index}.unit`)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Low</Label>
                      <Input type="number" step="any" {...form.register(`results.${index}.referenceRange.low`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>High</Label>
                      <Input type="number" step="any" {...form.register(`results.${index}.referenceRange.high`)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ testName: "", value: 0, unit: "", referenceRange: {}, notes: "", source: "manual" })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add result
            </Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Analyzing..." : "Analyze results"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
