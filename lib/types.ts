// Core Data Models

export interface Deck {
  id: string;
  name: string;
  prompt: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Topic {
  id: string;
  deck_id: string;
  name: string;
  stability: number;
  difficulty: number;
  next_review: string;
  last_reviewed: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BaseCard {
  id: string;
  topic_id: string;
  card_type: 'qa_hint' | 'multiple_choice';
  intrinsic_weight: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface QAHintCard extends BaseCard {
  card_type: 'qa_hint';
  question: string;
  answer: string;
  hint: string;
}

export interface MultipleChoiceCard extends BaseCard {
  card_type: 'multiple_choice';
  question: string;
  choices: string[];
  correct_index: number;
}

export type Card = QAHintCard | MultipleChoiceCard;

export interface UserProfile {
  user_id: string;
  username: string;
  avatar: string | null;
  role: 'user' | 'admin';
  ai_prompts: Record<string, any>;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReviewSubmission {
  base_score: 0 | 1 | 2 | 3;
}

export interface ReviewResponse {
  topic_id: string;
  new_stability: number;
  new_difficulty: number;
  next_review: string;
  message: string;
}

export type ReviewCardItem = Card;

export interface DeckReviewResponse {
  cards: ReviewCardItem[];
  total_due: number;
  deck_id: string;
}

// Request Types

export interface CreateDeckRequest {
  name: string;
  prompt: string;
}

export interface UpdateDeckRequest {
  name?: string;
  prompt?: string;
}

export interface CreateTopicRequest {
  deck_id: string;
  name: string;
  stability?: number;
  difficulty?: number;
}

export interface UpdateTopicRequest {
  name?: string;
  stability?: number;
  difficulty?: number;
}

export interface CreateQAHintCardRequest {
  topic_id: string;
  card_type: 'qa_hint';
  question: string;
  answer: string;
  hint?: string;
  intrinsic_weight?: number;
}

export interface CreateMultipleChoiceCardRequest {
  topic_id: string;
  card_type: 'multiple_choice';
  question: string;
  choices: string[];
  correct_index: number;
  intrinsic_weight?: number;
}

export type CreateCardRequest = CreateQAHintCardRequest | CreateMultipleChoiceCardRequest;

export interface UpdateCardRequest {
  intrinsic_weight?: number;
}

export interface CreateProfileRequest {
  username: string;
  avatar?: string;
  ai_prompts?: Record<string, any>;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  ai_prompts?: Record<string, any>;
}

export interface ApiError {
  detail: string;
}
