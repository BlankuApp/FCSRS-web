'use client';

import { useAISettings } from '@/contexts/ai-settings-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { AIProvider } from '@/lib/types';
import { AI_PROVIDERS } from '@/lib/ai-providers';

interface AIProviderSettingsProps {
  disabled?: boolean;
}

export default function AIProviderSettings({ disabled = false }: AIProviderSettingsProps) {
  const {
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
  } = useAISettings();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="ai-settings" className="border rounded-xl bg-muted/30 px-4">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
              <Settings className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium">AI Settings</span>
              <span className="text-xs text-muted-foreground">
                {AI_PROVIDERS[selectedProvider].displayName} · {AI_PROVIDERS[selectedProvider].models.find(m => m.id === selectedModel)?.name || selectedModel}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedProvider}
                onValueChange={(value) => setSelectedProvider(value as AIProvider)}
                disabled={disabled}
              >
                <SelectTrigger id="provider" className="w-auto min-w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                    <SelectItem 
                      key={provider} 
                      value={provider} 
                      className="text-xs"
                    >
                      {AI_PROVIDERS[provider].displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={disabled}
              >
                <SelectTrigger id="model" className="w-auto min-w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS[selectedProvider].models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-xs">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
