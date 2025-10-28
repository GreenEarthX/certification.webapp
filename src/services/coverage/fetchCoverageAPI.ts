export interface Coverage {
  coverage_id: number;
  coverage_label: string;
}

export const fetchCoverages = async (): Promise<Coverage[]> => {
  const res = await fetch("/api/admin/coverage");
  if (!res.ok) throw new Error("Failed to fetch coverages");
  return res.json();
};