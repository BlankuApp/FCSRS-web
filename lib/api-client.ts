import {
  Deck,
  Topic,
  TopicListResponse,
  Card,
  CardItem,
  UserProfile,
  ReviewResponse,
  DeckReviewResponse,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateCardRequest,
  CardCreateBatch,
  UpdateCardRequest,
  ReviewSubmission,
  CreateProfileRequest,
  UpdateProfileRequest,
  ApiError,
  AIProvider,
  GenerateCardsOptions,
  GenerateCardsResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.detail || 'An error occurred');
    }

    return data;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // Decks
  async createDeck(data: CreateDeckRequest): Promise<Deck> {
    return this.request('/decks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDecks(): Promise<Deck[]> {
    return this.request('/decks/');
  }

  async getDeck(deckId: string): Promise<Deck> {
    return this.request(`/decks/${deckId}`);
  }

  async updateDeck(deckId: string, data: UpdateDeckRequest): Promise<Deck> {
    return this.request(`/decks/${deckId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDeck(deckId: string): Promise<void> {
    return this.request(`/decks/${deckId}`, {
      method: 'DELETE',
    });
  }

  // Topics
  async createTopic(data: CreateTopicRequest): Promise<Topic> {
    return this.request('/topics/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTopicsByDeck(
    deckId: string,
    params?: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }
  ): Promise<TopicListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/topics/deck/${deckId}?${queryString}`
      : `/topics/deck/${deckId}`;
    
    return this.request(endpoint);
  }

  async getDueTopics(limit?: number): Promise<Topic[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/topics/due${query}`);
  }

  async getTopic(topicId: string): Promise<Topic> {
    return this.request(`/topics/${topicId}`);
  }

  async updateTopic(topicId: string, data: UpdateTopicRequest): Promise<Topic> {
    return this.request(`/topics/${topicId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTopic(topicId: string): Promise<void> {
    return this.request(`/topics/${topicId}`, {
      method: 'DELETE',
    });
  }

  // Cards (via Topics)
  async addCardsBatchToTopic(topicId: string, data: CardCreateBatch): Promise<Topic> {
    return this.request(`/topics/${topicId}/cards/batch`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTopicCards(topicId: string): Promise<CardItem[]> {
    return this.request(`/topics/${topicId}/cards`);
  }

  async updateTopicCard(topicId: string, index: number, data: UpdateCardRequest): Promise<Topic> {
    return this.request(`/topics/${topicId}/cards/${index}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTopicCard(topicId: string, index: number): Promise<Topic> {
    return this.request(`/topics/${topicId}/cards/${index}`, {
      method: 'DELETE',
    });
  }

  // Review
  async getDeckReviewCards(deckId: string): Promise<DeckReviewResponse> {
    return this.request(`/review/decks/${deckId}/cards`);
  }

  async getDeckPracticeCards(deckId: string): Promise<DeckReviewResponse> {
    return this.request(`/review/decks/${deckId}/practice`);
  }

  async submitCardReview(
    topicId: string,
    cardIndex: number,
    data: ReviewSubmission
  ): Promise<ReviewResponse> {
    return this.request(`/review/topics/${topicId}/cards/${cardIndex}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Profile
  async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
    return this.request('/profile/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request('/profile/');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.request('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getProfileById(userId: string): Promise<UserProfile> {
    return this.request(`/profile/${userId}`);
  }

  async updateProfileById(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    return this.request(`/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // AI Card Generation
  async generateCards(
    deckPrompt: string,
    topicName: string,
    options: GenerateCardsOptions
  ): Promise<GenerateCardsResponse> {
    return this.request('/ai/generate-cards', {
      method: 'POST',
      body: JSON.stringify({
        deck_prompt: deckPrompt,
        topic_name: topicName,
        provider: options.provider,
        model: options.model,
        api_key: options.apiKey,
      }),
    });
  }
}

export const apiClient = new ApiClient();
