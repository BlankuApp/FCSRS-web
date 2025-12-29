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
  cards: CardItem[];
  stability: number;
  difficulty: number;
  next_review: string;
  last_reviewed: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TopicListResponse {
  items: Topic[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Card Data Types (embedded in topics)
export interface QAHintData {
  question: string;
  answer: string;
  hint: string;
}

export interface MultipleChoiceData {
  question: string;
  choices: string[];
  correct_index: number;
  explanation: string;
}

export interface CardItem {
  card_type: 'qa_hint' | 'multiple_choice';
  intrinsic_weight: number;
  card_data: QAHintData | MultipleChoiceData;
}

// Legacy Card types for backward compatibility during migration
export interface BaseCard {
  card_type: 'qa_hint' | 'multiple_choice';
  intrinsic_weight: number;
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
  explanation: string;
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
  card_index: number;
  new_stability: number;
  new_difficulty: number;
  next_review: string;
  message: string;
}

export interface ReviewCardItem {
  topic_id: string;
  card_index: number;
  card_type: 'qa_hint' | 'multiple_choice';
  intrinsic_weight: number;
  card_data: QAHintData | MultipleChoiceData;
}

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
  card_type: 'qa_hint';
  question: string;
  answer: string;
  hint?: string;
  intrinsic_weight?: number;
}

export interface CreateMultipleChoiceCardRequest {
  card_type: 'multiple_choice';
  question: string;
  choices: string[];
  correct_index: number;
  explanation?: string;
  intrinsic_weight?: number;
}

export type CreateCardRequest = CreateQAHintCardRequest | CreateMultipleChoiceCardRequest;

export interface CardCreateBatch {
  cards: CreateCardRequest[];
  mode?: 'append' | 'replace';
}

export interface UpdateCardRequest {
  intrinsic_weight?: number;
  question?: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
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
