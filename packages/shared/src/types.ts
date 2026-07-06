export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role?: UserRole;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PlaybackUpdateDto {
  position: number;
  duration?: number;
  playbackSpeed?: number;
  isCompleted?: boolean;
  deviceId?: string;
}

export interface StreamUrlResponse {
  url: string;
  expiresAt: string;
  contentType: string;
  duration: number;
}

export interface SearchResult {
  contents: ContentSummary[];
  episodes: EpisodeSummary[];
  creators: CreatorSummary[];
}

export interface ContentSummary {
  id: string;
  type: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  creator: CreatorSummary;
  episodeCount: number;
  isPremium: boolean;
}

export interface EpisodeSummary {
  id: string;
  title: string;
  slug: string;
  duration: number;
  episodeNumber: number;
  contentId: string;
  contentTitle: string;
  isVideo: boolean;
}

export interface CreatorSummary {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export type ContentType = 'PODCAST' | 'AUDIOBOOK' | 'VIDEO';
export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';
