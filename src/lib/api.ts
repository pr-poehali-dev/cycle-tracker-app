const API_BASE = {
  auth: 'https://functions.poehali.dev/3f64293d-7e2c-4cfa-aacf-7d62060f9349',
  cycles: 'https://functions.poehali.dev/4fcf8298-e4e0-4c6b-8863-ac9de9936db6',
  tracking: 'https://functions.poehali.dev/35593cfe-21fc-477c-bebc-f9c7f920e930',
};

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Cycle {
  id: number;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodLength?: number;
  notes?: string;
  createdAt?: string;
}

export interface Predictions {
  nextPeriod: string;
  ovulation: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  currentPhase: string;
  daysUntilPeriod: number;
  currentCycleDay?: number;
}

export interface DailyLog {
  date: string;
  mood?: number;
  painLevel?: number;
  flowIntensity?: number;
  energyLevel?: number;
  sleepHours?: number;
  waterGlasses?: number;
  exerciseMinutes?: number;
  caloriesIntake?: number;
  weight?: number;
  temperature?: number;
  notes?: string;
  symptoms?: Array<{
    type: string;
    severity: number;
    notes?: string;
  }>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async getAuthUrl(provider: 'google' | 'yandex'): Promise<{ authUrl: string }> {
    return this.request(`${API_BASE.auth}?provider=${provider}&action=login`);
  }

  async handleAuthCallback(code: string, provider: string): Promise<AuthResponse> {
    return this.request(`${API_BASE.auth}?action=callback&code=${code}&provider=${provider}`);
  }

  async verifyToken(token: string): Promise<{ user: User }> {
    return this.request(API_BASE.auth, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Cycles methods
  async getCycles(limit: number = 12): Promise<{ cycles: Cycle[]; predictions: Predictions }> {
    return this.request(`${API_BASE.cycles}?limit=${limit}`);
  }

  async createCycle(data: { startDate: string; endDate?: string; notes?: string }): Promise<Cycle> {
    return this.request(API_BASE.cycles, {
      method: 'POST',
      body: JSON.dumps(data),
    });
  }

  async updateCycle(data: { id: number; endDate?: string; notes?: string }): Promise<Cycle> {
    return this.request(API_BASE.cycles, {
      method: 'PUT',
      body: JSON.dumps(data),
    });
  }

  // Tracking methods
  async getDailyLog(date?: string): Promise<DailyLog> {
    const url = date ? `${API_BASE.tracking}?date=${date}` : API_BASE.tracking;
    return this.request(url);
  }

  async getLogsRange(date: string, range: number): Promise<{ logs: DailyLog[] }> {
    return this.request(`${API_BASE.tracking}?date=${date}&range=${range}`);
  }

  async saveDailyLog(data: DailyLog): Promise<DailyLog> {
    return this.request(API_BASE.tracking, {
      method: 'POST',
      body: JSON.dumps(data),
    });
  }
}

export const api = new ApiClient();
