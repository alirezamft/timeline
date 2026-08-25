import { notFound, redirect } from "next/navigation";
import { canAccessWorkspace, getAuthContext } from "@/lib/auth";
import { getPortfolioOverview, getWorkspaceBySlug } from "@/lib/portfolio-server";
import { ProductDetail } from "@/components/portfolio-surface";

type PageProps = { params: Promise<{ slug: string; productId: string }> };

export default async function ProductPage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  const { slug, productId } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  if (!canAccessWorkspace(auth.user, workspace.id)) redirect("/");
  const data = await getPortfolioOverview(workspace.id);
  const product = data?.products.find((item) => item.id === productId);
  if (!data || !product) notFound();
  return <ProductDetail data={JSON.parse(JSON.stringify(data))} product={JSON.parse(JSON.stringify(product))} />;
}
