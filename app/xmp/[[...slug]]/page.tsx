import { XmpShell } from "../xmp-shell";
import { XMP_MODULES } from "../demo-data";
import type { XmpModuleId } from "../model";

export default async function XmpPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const requested = (slug[0] || "overview") as XmpModuleId;
  const current = XMP_MODULES.some((module) => module.id === requested) ? requested : "overview";
  return <XmpShell current={current} />;
}
