"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOnboardingStatus,
  getPersonalDetails,
  getOrganization,
  savePersonalDetails,
  saveOrganization,
  type PersonalDetails,
  type OrganizationDetails,
} from "@/services/onboarding/onboardingService";
import PersonalDetailsForm from "./components/PersonalDetailsForm";
import OrganizationForm from "./components/OrganizationForm";

// Full cross-app sign-out, then back to the cert webapp on re-login. The
// onboarding app's NextAuth redirect callback whitelists localhost:3001, so
// callbackUrl=origin returns here; with no token, AuthGuard then shows the login
// form (carrying redirect back to this app).
const handleLogout = () => {
  const onboardingUrl = process.env.NEXT_PUBLIC_ONBOARDING_URL;
  const callback = typeof window !== "undefined" ? window.location.origin : "";
  localStorage.clear();
  window.location.href = `${onboardingUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(callback)}`;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const [personal, setPersonal] = useState<PersonalDetails | null>(null);
  const [organization, setOrganization] = useState<OrganizationDetails | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [status, p, o] = await Promise.all([
          getOnboardingStatus(),
          getPersonalDetails(),
          getOrganization(),
        ]);
        if (!active) return;
        setPersonal(p);
        setOrganization(o);
        setStep(status.personalComplete ? 2 : 1);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePersonal = async (data: PersonalDetails) => {
    setSubmitting(true);
    setError(null);
    try {
      const saved = await savePersonalDetails(data);
      setPersonal(saved ?? data);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrganization = async (data: OrganizationDetails) => {
    setSubmitting(true);
    setError(null);
    try {
      await saveOrganization(data);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save organization");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <Image
              src="/logoGEX.png"
              alt="GreenEarthX"
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
              GreenEarthX
            </h1>
            <p className="text-xs text-slate-500">Account setup</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-slate-300 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </header>

      <div className="flex flex-1 items-start justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome to GreenEarthX
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              A couple of quick steps to set up your account.
            </p>
          </div>

          <div className="mt-6">
            <Stepper step={step} />
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#0F766E] to-[#15936B] px-6 py-5">
              <h2 className="text-xl font-semibold text-white">
                {step === 1 ? "Personal Details" : "Organization"}
              </h2>
              <p className="mt-1 text-sm text-teal-50/90">
                {step === 1
                  ? "Step 1 of 2 — tell us who you are."
                  : "Step 2 of 2 — about the organization you represent."}
              </p>
            </div>

            <div className="px-6 py-6">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Loading…
              </div>
            ) : step === 1 ? (
              <PersonalDetailsForm
                initial={personal}
                submitting={submitting}
                onSubmit={handlePersonal}
              />
            ) : (
              <OrganizationForm
                initial={organization}
                submitting={submitting}
                onBack={() => setStep(1)}
                onSubmit={handleOrganization}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const steps = ["Personal Details", "Organization"];
  return (
    <div className="flex items-center gap-3">
      {steps.map((label, i) => {
        const index = (i + 1) as 1 | 2;
        const done = step > index;
        const active = step === index;
        const circle = done
          ? "border-[#0F766E] bg-[#0F766E] text-white"
          : active
            ? "border-[#0F766E] text-[#0F766E]"
            : "border-slate-300 text-slate-400";
        return (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${circle}`}
            >
              {done ? <Check className="h-4 w-4" /> : index}
            </div>
            <span
              className={`text-sm font-medium ${
                active || done ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`ml-1 h-px flex-1 ${
                  step > index ? "bg-[#0F766E]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
