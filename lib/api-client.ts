import {
  Deck,
  Topic,
  Card,
  UserProfile,
  ReviewResponse,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateCardRequest,
  UpdateCardRequest,
  ReviewSubmission,
  CreateProfileRequest,
  UpdateProfileRequest,
  ApiError,
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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

  async getTopicsByDeck(deckId: string): Promise<Topic[]> {
    return this.request(`/topics/deck/${deckId}`);
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

  // Cards
  async createCard(data: CreateCardRequest): Promise<Card> {
    return this.request('/cards/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCardsByTopic(topicId: string): Promise<Card[]> {
    return this.request(`/cards/topic/${topicId}`);
  }

  async getCard(cardId: string): Promise<Card> {
    return this.request(`/cards/${cardId}`);
  }

  async updateCard(cardId: string, data: UpdateCardRequest): Promise<Card> {
    return this.request(`/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCard(cardId: string): Promise<void> {
    return this.request(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // Review
  async getReviewCard(topicId: string): Promise<Card> {
    return this.request(`/review/topics/${topicId}/review-card`);
  }

  async submitReview(
    topicId: string,
    data: ReviewSubmission
  ): Promise<ReviewResponse> {
    return this.request(`/review/topics/${topicId}/submit-review`, {
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
}

export const apiClient = new ApiClient();
