'use client';

import { useAuth } from '@/contexts/auth-context';
import { useAISettings } from '@/contexts/ai-settings-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Lock } from 'lucide-react';
import { AIProvider } from '@/lib/types';
import { AI_PROVIDERS, DEFAULT_PROVIDER } from '@/lib/ai-providers';

interface AIProviderSettingsProps {
  disabled?: boolean;
}

export default function AIProviderSettings({ disabled = false }: AIProviderSettingsProps) {
  const { role } = useAuth();
  const {
    selectedProvider,
    selectedModel,
    apiKey,
    rememberApiKey,
    setSelectedProvider,
    setSelectedModel,
    setApiKey,
    setRememberApiKey,
  } = useAISettings();

  const isPremiumUser = role === 'admin' || role === 'pro';

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
              {!isPremiumUser && !apiKey.trim() ? (
                <span className="text-xs text-destructive">API key required</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {AI_PROVIDERS[selectedProvider].displayName} · {AI_PROVIDERS[selectedProvider].models.find(m => m.id === selectedModel)?.name || selectedModel}
                </span>
              )}
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
                      disabled={isPremiumUser && provider !== DEFAULT_PROVIDER}
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
            {!isPremiumUser && (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`${AI_PROVIDERS[selectedProvider].displayName} API key`}
                    disabled={disabled}
                    autoComplete="on"
                    className="h-8 text-xs flex-1"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Checkbox
                      id="rememberApiKey"
                      checked={rememberApiKey}
                      onCheckedChange={(checked) => setRememberApiKey(checked as boolean)}
                      disabled={disabled}
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor="rememberApiKey"
                      className="text-[11px] cursor-pointer flex items-center gap-1 m-0"
                    >
                      <Lock className="h-3 w-3" />
                      Remember
                    </Label>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
