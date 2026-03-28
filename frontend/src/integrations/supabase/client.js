// This file now re-exports the new API client (replacing Supabase).
// Any existing code that imports from this path will continue to work.
// Migrate imports to "@/lib/apiClient" over time.
export { default as supabase } from "@/lib/apiClient";