"use client";

import { apiFetch } from "@/services/api-client";

export interface OnboardingStatus {
  personalComplete: boolean;
  organizationComplete: boolean;
  complete: boolean;
}

export interface PersonalDetails {
  first_name: string;
  last_name: string;
  job_title: string;
  role_in_organization: string;
  work_email: string;
  phone?: string;
  linkedin?: string;
}

export interface OrganizationDetails {
  name: string;
  legal_form?: string;
  year_founded?: number;
  org_email?: string;
  telephone?: string;
  website?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  industry?: string;
  company_size?: string;
}

export function getOnboardingStatus() {
  return apiFetch<OnboardingStatus>("/onboarding/status");
}

export function getPersonalDetails() {
  return apiFetch<PersonalDetails | null>("/onboarding/personal-details");
}

export function savePersonalDetails(data: PersonalDetails) {
  return apiFetch<PersonalDetails>("/onboarding/personal-details", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getOrganization() {
  return apiFetch<OrganizationDetails | null>("/onboarding/organization");
}

export function saveOrganization(data: OrganizationDetails) {
  return apiFetch<OrganizationDetails>("/onboarding/organization", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
