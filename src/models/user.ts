export interface User {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number?: string | null;
  user_role?: string | null;
  position?: string | null;
  company?: string | null;
  auth0sub?: string | null;
  created_at?: string | null;
  address?: {
    address_id: number;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    region?: string | null;
  } | null;
}
  
