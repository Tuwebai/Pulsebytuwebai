import { useEffect, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useMultiAI } from '@/hooks/useMultiAI';

import {
  buildAdminGreetingPrompt,
  buildClientGreetingPrompt,
  getFallbackGreeting,
  loadStoredGreeting,
  saveGreeting,
  isStoredGreetingValid,
} from '@/components/topbar/topbarGreeting.utils';

interface UseTopbarGreetingParams {
  isAdminPage: boolean;
  isClientPulseRoute: boolean;
}

export function useTopbarGreeting({
  isAdminPage,
  isClientPulseRoute,
}: UseTopbarGreetingParams) {
  const { user, getUserProjects } = useApp();
  const { sendMessage, isLoading: aiLoading } = useMultiAI();
  const [aiGreeting, setAiGreeting] = useState('');
  const [greetingGenerated, setGreetingGenerated] = useState(false);

  const setFallbackGreeting = () => {
    const fallbackGreeting = getFallbackGreeting();
    setAiGreeting(fallbackGreeting);
    setGreetingGenerated(true);
    saveGreeting(fallbackGreeting);
  };

  const requestGreeting = async (prompt: string) => {
    const response = await sendMessage(prompt, [], 'general');
    setAiGreeting(response);
    setGreetingGenerated(true);
    saveGreeting(response);
  };

  const generateAdminAIGreeting = async () => {
    if (!isAdminPage || greetingGenerated || aiLoading) {
      return;
    }

    try {
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      const userName = user?.full_name?.split(' ')[0] || 'Administrador';
      await requestGreeting(buildAdminGreetingPrompt(userName, hour, dayOfWeek));
    } catch (error) {
      console.error('Error generando saludo con IA:', error);
      setFallbackGreeting();
    }
  };

  const generateClientAIGreeting = async () => {
    if (!isClientPulseRoute || greetingGenerated || aiLoading) {
      return;
    }

    try {
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      const userName = user?.full_name?.split(' ')[0] || 'Usuario';
      const projectCount = getUserProjects().length;
      await requestGreeting(buildClientGreetingPrompt(userName, hour, dayOfWeek, projectCount));
    } catch (error) {
      console.error('Error generando saludo con IA:', error);
      setFallbackGreeting();
    }
  };

  useEffect(() => {
    if (!user || greetingGenerated) {
      return;
    }

    const storedGreeting = loadStoredGreeting();
    if (storedGreeting) {
      setAiGreeting(storedGreeting);
      setGreetingGenerated(true);
      return;
    }

    if (isAdminPage) {
      void generateAdminAIGreeting();
      return;
    }

    if (isClientPulseRoute) {
      void generateClientAIGreeting();
    }
  }, [greetingGenerated, isAdminPage, isClientPulseRoute, user]);

  useEffect(() => {
    if (!isAdminPage && !isClientPulseRoute) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (isStoredGreetingValid()) {
        return;
      }

      setGreetingGenerated(false);

      if (isAdminPage) {
        void generateAdminAIGreeting();
        return;
      }

      if (isClientPulseRoute) {
        void generateClientAIGreeting();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAdminPage, isClientPulseRoute]);

  return {
    aiLoading,
    greeting: aiGreeting || getFallbackGreeting(),
  };
}
