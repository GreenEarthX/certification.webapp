"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PlantBuilderWelcomeLoader from "@/components/plant-builder/PlantBuilderWelcomeLoader";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/plant-operator/plant-builder");
  }, [router]);

  return <PlantBuilderWelcomeLoader />;
}
