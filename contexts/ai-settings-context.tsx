'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIProvider } from '@/lib/types';
import { AI_PROVIDERS, DEFAULT_PROVIDER, getDefaultModel } from '@/lib/ai-providers';

interface AISettingsContextType {
  selectedProvider: AIProvider;
  selectedModel: string;
  apiKey: string;
  rememberApiKey: boolean;
  setSelectedProvider: (provider: AIProvider) => void;
  setSelectedModel: (model: string) => void;
  setApiKey: (key: string) => void;
  setRememberApiKey: (remember: boolean) => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiProvider');
      if (saved && saved in AI_PROVIDERS) {
        return saved as AIProvider;
      }
    }
    return DEFAULT_PROVIDER;
  });

  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedProvider = localStorage.getItem('aiProvider') as AIProvider;
      const savedModel = localStorage.getItem('aiModel');
      if (savedProvider && savedModel) {
        const providerConfig = AI_PROVIDERS[savedProvider];
        if (providerConfig?.models.some(m => m.id === savedModel)) {
          return savedModel;
        }
      }
    }
    return getDefaultModel(DEFAULT_PROVIDER);
  });

  const [rememberApiKey, setRememberApiKeyState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rememberApiKey') === 'true';
    }
    return false;
  });

  const [apiKey, setApiKeyState] = useState(() => {
    if (typeof window !== 'undefined') {
      const remember = localStorage.getItem('rememberApiKey') === 'true';
      if (remember) {
        return localStorage.getItem('aiApiKey') || '';
      }
    }
    return '';
  });

  const setSelectedProvider = (provider: AIProvider) => {
    setSelectedProviderState(provider);
    const newModel = getDefaultModel(provider);
    setSelectedModelState(newModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiProvider', provider);
      localStorage.setItem('aiModel', newModel);
    }
  };

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiModel', model);
    }
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (typeof window !== 'undefined' && rememberApiKey) {
      localStorage.setItem('aiApiKey', key);
    }
  };

  const setRememberApiKey = (remember: boolean) => {
    setRememberApiKeyState(remember);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rememberApiKey', remember.toString());
      if (remember) {
        localStorage.setItem('aiApiKey', apiKey);
      } else {
        localStorage.removeItem('aiApiKey');
      }
    }
  };

  return (
    <AISettingsContext.Provider
      value={{
        selectedProvider,
        selectedModel,
        apiKey,
        rememberApiKey,
        setSelectedProvider,
        setSelectedModel,
        setApiKey,
        setRememberApiKey,
      }}
    >
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}
