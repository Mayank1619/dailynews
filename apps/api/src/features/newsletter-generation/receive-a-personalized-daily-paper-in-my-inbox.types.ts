/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * Types and interfaces
 */

export interface PersonalizedDailyPaperRequest {
  userId: string;
  date: Date;
  preferences: {
    topics: string[];
    region: string;
    deliveryTime: string;
  };
}

export interface PersonalizedDailyPaperResponse {
  newsletterId: string;
  userId: string;
  date: string;
  subject: string;
  sections: Array<{
    topic: string;
    storyCount: number;
  }>;
  status: 'generated' | 'failed';
  generatedAt: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  snippet: string;
  source: string;
  canonicalUrl: string;
  publicationDate: Date;
  topic: string;
  ranking: number;
  fallbackApplied: boolean;
}

export interface UserPreferences {
  userId: string;
  topics: string[];
  region: string;
  deliveryTime: string;
  newsletterEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Newsletter {
  id: string;
  userId: string;
  date: Date;
  subject: string;
  html: string;
  text: string;
  articleRefs: string[];
  status: 'pending' | 'generated' | 'sent' | 'failed';
  generatedAt: Date;
  sentAt?: Date;
}
