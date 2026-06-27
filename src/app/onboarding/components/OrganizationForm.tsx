"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEGAL_FORM,
  INDUSTRY,
  COMPANY_SIZE,
  type Option,
} from "@/constants/onboarding";
import type { OrganizationDetails } from "@/services/onboarding/onboardingService";
import Field from "./Field";
import {
  inputClass,
  selectTriggerClass,
  selectContentClass,
  selectItemClass,
  primaryBtnClass,
  outlineBtnClass,
} from "./styles";

type FormState = {
  name: string;
  legal_form: string;
  year_founded: string;
  org_email: string;
  telephone: string;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  industry: string;
  company_size: string;
};

const toState = (initial: OrganizationDetails | null): FormState => ({
  name: initial?.name ?? "",
  legal_form: initial?.legal_form ?? "",
  year_founded: initial?.year_founded ? String(initial.year_founded) : "",
  org_email: initial?.org_email ?? "",
  telephone: initial?.telephone ?? "",
  website: initial?.website ?? "",
  street: initial?.street ?? "",
  city: initial?.city ?? "",
  postal_code: initial?.postal_code ?? "",
  country: initial?.country ?? "",
  industry: initial?.industry ?? "",
  company_size: initial?.company_size ?? "",
});

export default function OrganizationForm({
  initial,
  submitting,
  onBack,
  onSubmit,
}: {
  initial: OrganizationDetails | null;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (data: OrganizationDetails) => void;
}) {
  const [data, setData] = useState<FormState>(toState(initial));
  const [nameError, setNameError] = useState<string | undefined>();

  const set = (field: keyof FormState) => (value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (field === "name") setNameError(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) {
      setNameError("Organization name is required");
      return;
    }

    const clean = (v: string) => (v.trim() ? v.trim() : undefined);
    const payload: OrganizationDetails = {
      name: data.name.trim(),
      legal_form: clean(data.legal_form),
      year_founded: data.year_founded ? Number(data.year_founded) : undefined,
      org_email: clean(data.org_email),
      telephone: clean(data.telephone),
      website: clean(data.website),
      street: clean(data.street),
      city: clean(data.city),
      postal_code: clean(data.postal_code),
      country: clean(data.country),
      industry: clean(data.industry),
      company_size: clean(data.company_size),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-500">
        Tell us about the organization you represent. Each chapter is
        independent — only the organization identity chapter is mandatory at this
        stage.
      </p>

      <Accordion
        type="multiple"
        defaultValue={["identity"]}
        className="rounded-lg border border-slate-200 bg-white px-4"
      >
        <AccordionItem value="identity" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:no-underline">
            <span>
              1 · Organization Identity
              <span className="ml-2 text-xs font-normal text-red-500">
                required
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-5">
            <Field label="Organization Name" required error={nameError}>
              <Input
                className={inputClass}
                value={data.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Acme Hydrogen GmbH"
              />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Legal Form">
                <EnumSelect
                  value={data.legal_form}
                  options={LEGAL_FORM}
                  onChange={set("legal_form")}
                />
              </Field>
              <Field label="Year Founded">
                <Input
                  className={inputClass}
                  type="number"
                  inputMode="numeric"
                  value={data.year_founded}
                  onChange={(e) => set("year_founded")(e.target.value)}
                  placeholder="2015"
                />
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:no-underline">
            2 · Contact Channels
          </AccordionTrigger>
          <AccordionContent className="space-y-5">
            <p className="text-sm text-slate-500">
              Email, phone and website for the organization.
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Organization Email">
                <Input
                  className={inputClass}
                  type="email"
                  value={data.org_email}
                  onChange={(e) => set("org_email")(e.target.value)}
                  placeholder="info@company.com"
                />
              </Field>
              <Field label="Telephone">
                <Input
                  className={inputClass}
                  value={data.telephone}
                  onChange={(e) => set("telephone")(e.target.value)}
                  placeholder="+49 …"
                />
              </Field>
            </div>
            <Field label="Website">
              <Input
                className={inputClass}
                value={data.website}
                onChange={(e) => set("website")(e.target.value)}
                placeholder="https://company.com"
              />
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="address" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:no-underline">
            3 · Address
          </AccordionTrigger>
          <AccordionContent className="space-y-5">
            <Field label="Street">
              <Input
                className={inputClass}
                value={data.street}
                onChange={(e) => set("street")(e.target.value)}
                placeholder="123 Industrial Ave"
              />
            </Field>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="City">
                <Input
                  className={inputClass}
                  value={data.city}
                  onChange={(e) => set("city")(e.target.value)}
                />
              </Field>
              <Field label="Postal Code">
                <Input
                  className={inputClass}
                  value={data.postal_code}
                  onChange={(e) => set("postal_code")(e.target.value)}
                />
              </Field>
              <Field label="Country">
                <Input
                  className={inputClass}
                  value={data.country}
                  onChange={(e) => set("country")(e.target.value)}
                />
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="business" className="border-b-0">
          <AccordionTrigger className="text-slate-900 hover:no-underline">
            4 · Business Profile
          </AccordionTrigger>
          <AccordionContent className="space-y-5">
            <p className="text-sm text-slate-500">Industry and company size.</p>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Industry / Sector">
                <EnumSelect
                  value={data.industry}
                  options={INDUSTRY}
                  onChange={set("industry")}
                />
              </Field>
              <Field label="Company Size">
                <EnumSelect
                  value={data.company_size}
                  options={COMPANY_SIZE}
                  onChange={set("company_size")}
                />
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="text-xs text-slate-400">
        You can complete the optional sections later from your profile.
      </p>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          onClick={onBack}
          size="lg"
          className={outlineBtnClass}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className={primaryBtnClass}
        >
          {submitting ? "Saving…" : "Finish"}
        </Button>
      </div>
    </form>
  );
}

function EnumSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={selectTriggerClass}>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent className={selectContentClass}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className={selectItemClass}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
