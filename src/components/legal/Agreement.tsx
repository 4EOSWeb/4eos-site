import type { ReactNode } from "react";

type Run = {
  t: string;
  strong?: boolean;
  em?: boolean;
  href?: string;
};

function textOf(runs: Run[]) {
  return runs.map((run) => run.t).join("");
}

function RunText({ run }: { run: Run }) {
  let node: ReactNode = run.t;
  if (run.em) node = <em>{node}</em>;
  if (run.strong) node = <strong className="font-medium text-fg">{node}</strong>;
  if (run.href) {
    node = (
      <a
        href={run.href}
        className="underline decoration-hairline-strong underline-offset-4 hover:text-gold"
      >
        {node}
      </a>
    );
  }
  return node;
}

/** The published Master Services Agreement, one paragraph at a time. */
export function Agreement({ blocks }: { blocks: Run[][] }) {
  return (
    <div className="max-w-[68ch]">
      {blocks.map((runs, index) => {
        const text = textOf(runs).trim();
        const title = /^\d+\.\s/.test(text) && text.length < 80 && text.endsWith(".");
        const dash = text.startsWith("-");
        return (
          <p
            key={index}
            className={`body-sm ${title ? "mt-10 text-fg" : dash ? "mt-1 pl-4" : "mt-4"}`}
          >
            {runs.map((run, i) => (
              <RunText key={i} run={run} />
            ))}
          </p>
        );
      })}
    </div>
  );
}
