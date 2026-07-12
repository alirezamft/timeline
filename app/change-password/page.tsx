import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function ChangePasswordPage() {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  return <ChangePasswordForm user={auth.user} />;
}
