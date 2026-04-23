export const KeyTakeaways = ({ items }: { items: string[] }) => {
  if (!items?.length) return null;
  return (
    <aside className="callout border-l-4 border-l-primary not-prose">
      <p className="font-serif text-lg font-semibold mb-2">Key Takeaways</p>
      <ul className="list-disc pl-5 space-y-1.5 text-[0.95rem] text-foreground/90">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </aside>
  );
};

export default KeyTakeaways;
