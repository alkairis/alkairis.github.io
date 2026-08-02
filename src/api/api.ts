import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const DEFAULT_TIMEOUT_MS = 15_000;

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export type ApiError = {
  message: string;
  status: number;
  data: ApiErrorResponse | null;
  isNetworkError: boolean;
  originalError: AxiosError<ApiErrorResponse>;
};

export type BlogDto = {
  title: string;
  link: string;
  image?: string | null;
  keywords?: string[];
  pub_date?: string | null;
};

export type BlogPost = {
  title: string;
  link: string;
  image?: string | null;
  tags: string[];
  pubDate: string;
};

const apiClient = axios.create({
  // Relative default keeps dev requests same-origin (Vite proxies /api and
  // /blog to the backend). Production sets VITE_API_BASE_URL to the real host.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const createRequestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const AUTH_TOKEN_KEY = 'auth_token';

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    /* storage unavailable — nothing to persist */
  }
};

export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
};

export const isAuthenticated = (): boolean => Boolean(getAuthToken());

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    config.headers.set('X-Request-ID', createRequestId());

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;

    // A 401 on anything other than the login attempt means the stored session
    // token is missing/expired — drop it so guarded views redirect to sign-in.
    const requestUrl = error.config?.url ?? '';
    if (status === 401 && !requestUrl.includes('/api/auth/login')) {
      clearAuthToken();
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong while calling the API.';

    const apiError: ApiError = {
      message,
      status,
      data: error.response?.data ?? null,
      isNetworkError: !error.response,
      originalError: error,
    };

    return Promise.reject(apiError);
  }
);

const normalizeBlog = (blog: BlogDto): BlogPost => ({
  title: blog.title,
  link: blog.link,
  image: blog.image,
  tags: blog.keywords ?? [],
  pubDate: blog.pub_date ?? '',
});

export const getBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await apiClient.get<BlogDto[]>('/blog');
  return Array.isArray(data) ? data.map(normalizeBlog) : [];
};

export type TechnicalSkill = {
  id: string;
  name: string;
  image_url: string;
  description: string;
  skill_type: string;
  active: boolean;
};

export const getTechnicalSkills = async (): Promise<TechnicalSkill[]> => {
  const { data } = await apiClient.get<TechnicalSkill[]>('/api/technical-skills');
  return Array.isArray(data) ? data : [];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  github_url: string;
  demo_url: string;
  technologies: string[];
  image_url: string;
  active: boolean;
};

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await apiClient.get<Project[]>('/api/projects');
  return Array.isArray(data) ? data : [];
};

// ─── Certificates ─────────────────────────────────────────────────────────────

type CertificateDto = {
  id: string;
  name: string;
  issued_by: string;
  issued_by_image_url: string;
  certificate_image_url?: string | null;
  issue_date: string;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  active: boolean;
};

/** Card + modal shape consumed by the Certificates section. */
export type Certificate = {
  id: string;
  name: string;
  organization: string;
  image: string;
  certificateImage: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
};

/** Format an ISO date (YYYY-MM-DD) as e.g. "Aug 2025". Empty in → empty out. */
const formatMonthYear = (iso?: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const normalizeCertificate = (dto: CertificateDto): Certificate => ({
  id: dto.id,
  name: dto.name,
  organization: dto.issued_by,
  image: dto.issued_by_image_url,
  certificateImage: dto.certificate_image_url || dto.issued_by_image_url,
  issueDate: formatMonthYear(dto.issue_date),
  expiryDate: formatMonthYear(dto.expiration_date),
  credentialId: dto.credential_id ?? '',
  credentialUrl: dto.credential_url ?? '',
});

export const getCertificates = async (): Promise<Certificate[]> => {
  const { data } = await apiClient.get<CertificateDto[]>('/api/certificates');
  return Array.isArray(data) ? data.map(normalizeCertificate) : [];
};

// ─── Professional experience ──────────────────────────────────────────────────

type ProfessionalExperienceDto = {
  id: string;
  company_name: string;
  position: string;
  banner_image?: string | null;
  logo?: string | null;
  start_date: string;
  end_date?: string | null;
  responsibilities: string[];
  recognition?: string[] | null;
  is_present: boolean;
  active: boolean;
};

/** Timeline shape consumed by the Experience section. */
export type Experience = {
  id: string;
  company: string;
  title: string;
  bannerImage: string;
  logo: string;
  date: string;
  responsibilities: string[];
  recognition: string[];
};

const normalizeExperience = (dto: ProfessionalExperienceDto): Experience => {
  const start = formatMonthYear(dto.start_date);
  const end = dto.is_present ? 'Present' : formatMonthYear(dto.end_date);
  return {
    id: dto.id,
    company: dto.company_name,
    title: dto.position,
    bannerImage: dto.banner_image ?? '',
    logo: dto.logo ?? '',
    date: [start, end].filter(Boolean).join(' – '),
    responsibilities: dto.responsibilities ?? [],
    recognition: dto.recognition ?? [],
  };
};

export const getProfessionalExperience = async (): Promise<Experience[]> => {
  const { data } = await apiClient.get<ProfessionalExperienceDto[]>(
    '/api/professional-experience'
  );
  return Array.isArray(data) ? data.map(normalizeExperience) : [];
};

/**
 * Anchor for the "Years Experience" stat. Professional experience is counted
 * from July 2022, regardless of earlier education entries on the timeline.
 */
export const PROFESSIONAL_EXPERIENCE_START = '2022-07-01';

/** Whole years elapsed between two dates (anniversary-aware). Never negative. */
const fullYearsBetween = (from: Date, to: Date): number => {
  let years = to.getFullYear() - from.getFullYear();
  const beforeAnniversary =
    to.getMonth() < from.getMonth() ||
    (to.getMonth() === from.getMonth() && to.getDate() < from.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(years, 0);
};

/**
 * Years of professional experience, derived from the earliest ongoing role in
 * the professional-experience API and floored at the July 2022 anchor so the
 * count stays honest even before the API responds.
 */
export const getYearsOfExperience = async (): Promise<number> => {
  const anchor = new Date(PROFESSIONAL_EXPERIENCE_START);
  try {
    const { data } = await apiClient.get<ProfessionalExperienceDto[]>(
      '/api/professional-experience'
    );
    const startDates = (Array.isArray(data) ? data : [])
      .filter((exp) => exp.is_present && exp.active && exp.start_date)
      .map((exp) => new Date(exp.start_date))
      .filter((date) => !Number.isNaN(date.getTime()));

    const start = startDates.length
      ? new Date(Math.min(...startDates.map((date) => date.getTime())))
      : anchor;

    return fullYearsBetween(start, new Date());
  } catch {
    return fullYearsBetween(anchor, new Date());
  }
};

// ─── Achievements / Recognition ─────────────────────────────────────────────

type AchievementDto = {
  id: string;
  title: string;
  description: string;
  date: string;
  issued_by: string;
  keywords: string[];
  image_url?: string | null;
  link?: string | null;
  active: boolean;
};

/** Recognition timeline card consumed by the Achievements section. */
export type Recognition = {
  id: string;
  year: string;
  category: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
};

/** Extract the four-digit year from an ISO date. Empty in → empty out. */
const formatYear = (iso?: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getFullYear());
};

const normalizeAchievement = (dto: AchievementDto): Recognition => ({
  id: dto.id,
  year: formatYear(dto.date),
  category: dto.issued_by,
  title: dto.title,
  description: dto.description,
  image: dto.image_url ?? '',
  tags: dto.keywords ?? [],
  link: dto.link ?? '',
});

export const getAchievements = async (): Promise<Recognition[]> => {
  const { data } = await apiClient.get<AchievementDto[]>('/api/achievements');
  return Array.isArray(data) ? data.map(normalizeAchievement) : [];
};

// ─── Resume ───────────────────────────────────────────────────────────────────

/** Public URL of the resume PDF (backend-managed). */
export const getResumeUrl = async (): Promise<string> => {
  const { data } = await apiClient.get<{ url: string }>('/api/resume');
  return data?.url ?? '';
};

// ─── Social media / contact links ─────────────────────────────────────────────

export type SocialMedia = {
  id: string;
  name: string;
  url: string;
  icon: string;
  active: boolean;
};

export const getSocialMedia = async (): Promise<SocialMedia[]> => {
  const { data } = await apiClient.get<SocialMedia[]>('/api/social-media');
  return Array.isArray(data) ? data : [];
};

// ─── Contact form ─────────────────────────────────────────────────────────────

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

/** Send a contact-form message. Backend emails it via Resend. */
export const sendContact = async (payload: ContactPayload): Promise<void> => {
  await apiClient.post('/api/contact', payload);
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

/**
 * Authenticate with username + password, receive a JWT access token, and
 * persist it for subsequent write requests. Credentials are never stored.
 */
export const login = async (
  username: string,
  password: string
): Promise<void> => {
  clearAuthToken();
  const { data } = await apiClient.post<TokenResponse>('/api/auth/login', {
    username,
    password,
  });
  setAuthToken(data.access_token);
};

/** Confirm the stored session token is still valid (e.g. on admin load). */
export const verifySession = async (): Promise<boolean> => {
  if (!isAuthenticated()) return false;
  try {
    await apiClient.post('/api/auth/verify');
    return true;
  } catch {
    clearAuthToken();
    return false;
  }
};

export const logout = (): void => clearAuthToken();

// Generic helpers for the admin section pages.
export const apiGet = async <T>(path: string): Promise<T> => {
  const { data } = await apiClient.get<T>(path);
  return data;
};

export const apiCreate = async <T>(path: string, payload: unknown): Promise<T> => {
  const { data } = await apiClient.post<T>(path, payload);
  return data;
};

export const apiUpdate = async <T>(path: string, payload: unknown): Promise<T> => {
  const { data } = await apiClient.put<T>(path, payload);
  return data;
};

export const apiDelete = async (path: string): Promise<void> => {
  await apiClient.delete(path);
};

export default apiClient;
