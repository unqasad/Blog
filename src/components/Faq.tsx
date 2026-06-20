import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = { question: string; answer: string };

export const Faq = ({ items }: { items: FaqItem[] }) => {
  if (!items?.length) return null;
  return (
    <section
      aria-labelledby="faq-heading"
      id="frequently-asked-questions"
      className="mt-12 scroll-mt-24"
    >
      <h2 id="faq-heading" className="font-serif text-3xl tracking-tight">
        Frequently Asked Questions
      </h2>
      <Accordion
        type="multiple"
        className="mt-4 divide-y divide-border border-y border-border"
      >
        {items.map((it, i) => (
          <AccordionItem value={`item-${i}`} key={i} className="border-0">
            <AccordionTrigger className="text-left font-serif text-lg py-4 hover:no-underline">
              {it.question}
            </AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85 pb-4">
              {it.answer.split(/\n\n+/).map((p, j) => (
                <p key={j} className={j > 0 ? "mt-3" : undefined}>
                  {p}
                </p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default Faq;
