"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_IN_ORGANIZATION } from "@/constants/onboarding";
import type { PersonalDetails } from "@/services/onboarding/onboardingService";
import Field from "./Field";
import {
  inputClass,
  selectTriggerClass,
  selectContentClass,
  selectItemClass,
  primaryBtnClass,
} from "./styles";

type Errors = Partial<Record<keyof PersonalDetails, string>>;

const EMPTY: PersonalDetails = {
  first_name: "",
  last_name: "",
  job_title: "",
  role_in_organization: "",
  work_email: "",
  phone: "",
  linkedin: "",
};

export default function PersonalDetailsForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial: PersonalDetails | null;
  submitting: boolean;
  onSubmit: (data: PersonalDetails) => void;
}) {
  const [data, setData] = useState<PersonalDetails>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Errors>({});

  const set = (field: keyof PersonalDetails) => (value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!data.first_name.trim()) next.first_name = "First name is required";
    if (!data.last_name.trim()) next.last_name = "Last name is required";
    if (!data.job_title.trim()) next.job_title = "Job title is required";
    if (!data.role_in_organization)
      next.role_in_organization = "Please select a role";
    if (!data.work_email.trim()) next.work_email = "Work email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.work_email))
      next.work_email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...data,
      phone: data.phone?.trim() || undefined,
      linkedin: data.linkedin?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-500">
        We verify your identity as a representative of the organization. Fields
        marked with <span className="text-red-500">*</span> are mandatory.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="First Name" required error={errors.first_name}>
          <Input
            className={inputClass}
            value={data.first_name}
            onChange={(e) => set("first_name")(e.target.value)}
            placeholder="Jane"
          />
        </Field>
        <Field label="Last Name" required error={errors.last_name}>
          <Input
            className={inputClass}
            value={data.last_name}
            onChange={(e) => set("last_name")(e.target.value)}
            placeholder="Doe"
          />
        </Field>
      </div>

      <Field label="Job Title" required error={errors.job_title}>
        <Input
          className={inputClass}
          value={data.job_title}
          onChange={(e) => set("job_title")(e.target.value)}
          placeholder="Head of Compliance"
        />
      </Field>

      <Field
        label="Role in Organization"
        required
        error={errors.role_in_organization}
      >
        <Select
          value={data.role_in_organization || undefined}
          onValueChange={set("role_in_organization")}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {ROLE_IN_ORGANIZATION.map((o) => (
              <SelectItem key={o.value} value={o.value} className={selectItemClass}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Work Email" required error={errors.work_email}>
        <Input
          className={inputClass}
          type="email"
          value={data.work_email}
          onChange={(e) => set("work_email")(e.target.value)}
          placeholder="jane.doe@company.com"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Phone">
          <Input
            className={inputClass}
            value={data.phone ?? ""}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+49 …"
          />
        </Field>
        <Field label="LinkedIn Profile">
          <Input
            className={inputClass}
            value={data.linkedin ?? ""}
            onChange={(e) => set("linkedin")(e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className={primaryBtnClass}
        >
          {submitting ? "Saving…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
