import axios from 'axios';

type ValidationError = { message?: string };

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { errors?: unknown; detail?: string } | undefined;

    if (status === 422 && data?.errors) {
      if (Array.isArray(data.errors)) {
        const values = data.errors
          .map((item) => (item as ValidationError)?.message)
          .filter((message): message is string => Boolean(message));
        if (values.length > 0) return values.join('; ');
      }

      if (typeof data.errors === 'object' && data.errors !== null) {
        const values = Object.values(data.errors as Record<string, string[]>).flat();
        if (values.length > 0) return values.join('; ');
      }
    }

    if (typeof data?.detail === 'string' && data.detail) return data.detail;
    if (status === 400) return 'Bad request';
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    if (status === 404) return 'Not found';
    if (status === 409) return 'Conflict';
    if (status === 429) return 'Too many requests';
    if (status && status >= 500) return 'Server error';
  }

  return 'Unknown API error';
}
