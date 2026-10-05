import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export async function Mdx({ source }: { source: string }) {
  const compiled = String(await compile(source, { outputFormat: "function-body" }));
  const { default: Content } = await run(compiled, {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return (
    <div className="prose text-[length:var(--text-lg)]">
      <Content />
    </div>
  );
}
