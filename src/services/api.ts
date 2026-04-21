const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://fitcheck-backend-production.up.railway.app';

export interface UploadResponse {
  asset_id: string;
  url: string;
}

export interface TryOnResponse {
  job_id: string;
  session_id: string;
}

export interface ResultResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result_url?: string;
  quality_score?: number;
  error?: string;
}

export const uploadImage = async (uri: string): Promise<UploadResponse> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('file', { uri, name: filename, type } as any);

  const response = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};

export const startTryon = async (
  person_asset_id: string,
  garment_asset_ids: string[]
): Promise<TryOnResponse> => {
  const response = await fetch(`${BASE}/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person_asset_id, garment_asset_ids }),
  });

  if (!response.ok) {
    throw new Error(`Try-on request failed: ${response.statusText}`);
  }

  return response.json();
};

export const getResult = async (job_id: string): Promise<ResultResponse> => {
  const response = await fetch(`${BASE}/result/${job_id}`);

  if (!response.ok) {
    throw new Error(`Failed to get result: ${response.statusText}`);
  }

  return response.json();
};