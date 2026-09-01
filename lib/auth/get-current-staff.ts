import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

export type StaffSession = {
  user: {
    id: string;
    email?: string;
  };
  staff: AdminUser;
};

export async function getCurrentStaff(): Promise<StaffSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: staff, error: staffError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staff) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      staff,
    };
  } catch (error) {
    console.error("Failed to check staff session", error);
    return null;
  }
}
