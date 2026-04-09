export interface MentalModel {
  name: string;
  description: string;
}

export interface CommunicationStyle {
  tone: string;
  structure: string;
  signature: string;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  avatar: string; // emoji
  coreBeliefs: string[];
  mentalModels: MentalModel[];
  communicationStyle: CommunicationStyle;
  thinkingPatterns: string[];
  wouldPushBackOn: string[];
  characteristicPhrases: string[];
  systemPrompt: string;
  isCustom?: boolean;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type View =
  | { type: 'library' }
  | { type: 'create' }
  | { type: 'chat'; persona: Persona };
