import type { DigitalTwinValidationError } from "@/services/plant-builder/digitalTwins";

// Render "From/To component" context for validation list items.
export const formatValidationContext = (err: DigitalTwinValidationError) => {
  if (err.relatedComponentId) {
    return `From component ID: ${err.componentId} · To component ID: ${err.relatedComponentId}`;
  }
  return `Component ID: ${err.componentId}`;
};

// Truncate long messages for compact UI lists.
export const truncateMessage = (message: string, maxLength = 90) => {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, Math.max(0, maxLength - 1))}…`;
};

export const buildFallbackValidationError = (
  step: "structure" | "ports"
): DigitalTwinValidationError => ({
  componentId: "unknown",
  componentName: "System",
  componentType: "validation",
  errorCode: step === "ports" ? "PORT_VALIDATION_FAILED" : "STRUCTURE_VALIDATION_FAILED",
  errorMessage:
    step === "ports"
      ? "Port validation failed, but the server did not return details. Please try again or contact support."
      : "Structure validation failed, but the server did not return details. Please try again or contact support.",
});

// Convert backend port errors into short, human-readable messages.
export const formatPortErrorMessage = (
  err: DigitalTwinValidationError,
  resolveCarrierName?: (id: number) => string | undefined
) => {
  const code = (err.errorCode || "").toUpperCase();
  const raw = err.errorMessage || "";
  const portMatch = raw.match(/Port\s+([^\s]+)\s*\(([^)]+)\)/i);
  const portLabel = portMatch?.[2] || "";
  const carrierIdMatch = raw.match(/definition ID\s+(\d+)/i);
  const carrierId = carrierIdMatch ? Number.parseInt(carrierIdMatch[1], 10) : null;
  const carrierName = carrierId && resolveCarrierName ? resolveCarrierName(carrierId) : undefined;
  const carrierLabel = carrierName ? `Carrier "${carrierName}"` : carrierId ? `Carrier ID ${carrierId}` : "Carrier";

  if (code === "PORT_CARRIER_NOT_ALLOWED") {
    if (/IN port/i.test(raw)) return `${carrierLabel} not allowed on input port.`;
    if (/OUT port/i.test(raw)) return `${carrierLabel} not allowed on output port.`;
    return `${carrierLabel} not allowed on this port.`;
  }
  if (code === "PORT_REQUIRED_MISSING") {
    return portLabel
      ? `Required port missing carrier: ${portLabel}.`
      : "Required port missing carrier.";
  }
  if (code === "PORT_EXCLUSIVE_OVERFLOW") {
    return portLabel
      ? `Port allows only one carrier: ${portLabel}.`
      : "Port allows only one carrier.";
  }

  return raw.replace(/^\[Port\]\s*/i, "").trim() || "Port connection issue.";
};

export const formatCheckedAt = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
