/**
 * DEPRECATED: This file has been moved to src/services/api-client.ts
 * 
 * All API requests should now use the global apiFetch from @/services/api-client
 * 
 * Migration Guide:
 * - Change: import { apiFetch } from "./client"
 * - To:     import { apiFetch } from "@/services/api-client"
 * 
 * The global API client provides:
 * - Centralized authentication token management
 * - Consistent error handling across all services
 * - Reusable for new services beyond plant-builder
 */

export { apiFetch } from "../api-client";
