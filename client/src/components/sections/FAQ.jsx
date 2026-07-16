import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { FAQS } from '../../constants/content';

export default function FAQ() {
  return (
    <Section id="faq" className="bg-sand-50">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            eyebrow="Good to know"
            title="Questions, answered"
            lead="Everything you need before you go. Can’t find it? Our team replies within a day."
          />
          <Button to="/contact" variant="outline" className="mt-8">
            Ask us anything
          </Button>
        </div>

        <Reveal variant="up">
          <Accordion items={FAQS} />
        </Reveal>
      </div>
    </Section>
  );
}
