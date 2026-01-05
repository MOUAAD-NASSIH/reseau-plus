import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";

import {
  institutionInfoSchema,
  type InstitutionInfoForm,
} from "../institutionRegister.schema";
import { useInstitutionRegisterStore } from "../institutionRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/common/CitySelect";

export default function StepInstitutionInfo() {
  const { data, updateData } = useInstitutionRegisterStore();

  const form = useForm<InstitutionInfoForm>({
    resolver: zodResolver(institutionInfoSchema),
    mode: "onBlur",
    defaultValues: {
      institutionName: data.institutionName ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      const parsed = institutionInfoSchema.safeParse(values);
      if (parsed.success) updateData(parsed.data);
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Institution information
        </h2>
        <p className="text-muted-foreground">Tell us about your organization</p>
      </div>

      {/* Institution name */}
      <div className="space-y-2">
        <Label>Institution name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-11 h-12"
            placeholder="Social Care Center"
            {...form.register("institutionName")}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Address</Label>
        <Input
          className="h-12"
          placeholder="123 Main Street"
          {...form.register("address")}
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>City</Label>
        <Controller
          control={form.control}
          name="city"
          render={({ field }) => (
            <CitySelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select a city"
            />
          )}
        />
      </div>
    </div>
  );
}
