import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const auth = await getAuthContext();

  if (auth?.user.mustChangePassword) {
    redirect("/change-password");
  }

  if (auth?.user) {
    redirect("/");
  }

  return <LoginForm />;
}
