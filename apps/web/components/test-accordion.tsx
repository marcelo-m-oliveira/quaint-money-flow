'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'

export function TestAccordion() {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Teste do Accordion</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Teste 1</AccordionTrigger>
          <AccordionContent>
            <p>Conteúdo do teste 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Teste 2</AccordionTrigger>
          <AccordionContent>
            <p>Conteúdo do teste 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
