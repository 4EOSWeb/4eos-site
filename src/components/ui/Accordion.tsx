"use client";

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  index?: string;
  title: string;
  statement?: string;
  children: ReactNode;
};

/**
 * Replaces the 3-up card grid. One item open at a time; the Signal reacts
 * through `onChange` so the field and the copy stay on the same claim.
 */
export function Accordion({
  items,
  onChange,
  onHover,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  onChange?: (index: number) => void;
  onHover?: (index: number | null) => void;
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();

  return (
    <ul onMouseLeave={() => onHover?.(null)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
        return (
          <li key={item.id} className="border-t border-hairline last:border-b">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onMouseEnter={() => onHover?.(i)}
                onClick={() => {
                  setOpen(i);
                  onChange?.(i);
                }}
                className="flex w-full items-baseline gap-[3vw] py-5 text-left transition-colors hover:text-gold"
              >
                <span className="micro w-8 shrink-0">
                  {item.index ?? String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.8vw,2.2rem)]">
                  {item.title}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="grid grid-cols-1 gap-8 pb-10 pl-[calc(2rem+3vw)] md:grid-cols-12"
            >
              {item.statement ? (
                <p className="lede md:col-span-5">{item.statement}</p>
              ) : null}
              <div className={item.statement ? "md:col-span-7" : "md:col-span-12"}>
                {item.children}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
