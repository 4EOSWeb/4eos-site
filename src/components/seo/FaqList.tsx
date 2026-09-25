export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <dl>
      {items.map((item, i) => (
        <div key={item.q} className="border-t border-hairline py-8 last:border-b">
          <dt className="flex gap-[3vw]">
            <span className="micro text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="display text-[clamp(1.4rem,2.6vw,2.2rem)]">{item.q}</span>
          </dt>
          <dd className="lede mt-4 pl-[calc(2rem+3vw)]">{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
