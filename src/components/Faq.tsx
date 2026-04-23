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
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="font-serif text-3xl tracking-tight">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="mt-4">
        {items.map((it, i) => (
          <AccordionItem value={`item-${i}`} key={i} className="border-border">
            <AccordionTrigger className="text-left font-serif text-lg">
              {it.question}
            </AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              {it.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default Faq;
