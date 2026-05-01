const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://fitcheck-backend-production.up.railway.app';

export const WS_BASE = BASE.replace(/^https/, 'wss').replace(/^http/, 'ws');

// ── Types ────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  asset_id: string;
  url: string;
}

export interface CreateUserResponse {
  id: string;
  points: number;
}

export interface SoulIdResponse {
  soulId: string;
}

export interface GenerateResponse {
  generationId: string;
  jobId: string;
  pointsRemaining: number;
}

export interface ResultResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result_url?: string;
  quality_score?: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? res.statusText);
  }
  return res.json();
}

// ── User ─────────────────────────────────────────────────────────────────────

export const createUser = (): Promise<CreateUserResponse> =>
  post('/users', {});

export const createSoulId = (
  userId: string,
  imageUrls: string[]
): Promise<SoulIdResponse> =>
  post(`/users/${userId}/soul-id`, { imageUrls });

// ── Upload ───────────────────────────────────────────────────────────────────

export const uploadImage = async (uri: string, file?: File): Promise<UploadResponse> => {
  const formData = new FormData();
  const filename = 'photo.jpg';

  if (file) {
    // Best path on web: use the raw File object directly — no blob URL fetch needed
    formData.append('file', file, filename);
  } else if (uri.startsWith('blob:') || uri.startsWith('data:')) {
    // Fallback: fetch blob URL (may fail in some Safari versions)
    const blobRes = await fetch(uri);
    const blob = await blobRes.blob();
    formData.append('file', blob, filename);
  } else {
    // React Native native path
    const match = /\.(\w+)$/.exec(uri.split('/').pop() ?? '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('file', { uri, name: filename, type } as any);
  }

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  return res.json();
};

// ── Generate ─────────────────────────────────────────────────────────────────

export const generate = (
  userId: string,
  garmentImageUrls: string[],
  brandPaid = false
): Promise<GenerateResponse> =>
  post('/generate', { userId, garmentImageUrls, brandPaid });

// ── Result ───────────────────────────────────────────────────────────────────

export const getResult = async (job_id: string): Promise<ResultResponse> => {
  const res = await fetch(`${BASE}/result/${job_id}`);
  if (!res.ok) throw new Error(`Failed to get result: ${res.statusText}`);
  return res.json();
};
