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

export interface ApiError {
  detail: string;
}

// AI Provider Types
export type AIProvider = 'openai' | 'google' | 'xai' | 'anthropic';

export interface AIModel {
  id: string;
  name: string;
}

export interface AIProviderConfig {
  displayName: string;
  models: AIModel[];
}

export interface GenerateCardsOptions {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface GeneratedCardResponse {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
}

export interface GenerateCardsResponse {
  cards: GeneratedCardResponse[];
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
}

// User Management Types (Admin)
export interface UserInfo {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  role: 'user' | 'pro' | 'admin';
  created_at: string;
}

export interface UserListResponse {
  items: UserInfo[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'pro' | 'admin';
}

export interface UpdateUserRoleResponse {
  user_id: string;
  role: string;
  message: string;
}
