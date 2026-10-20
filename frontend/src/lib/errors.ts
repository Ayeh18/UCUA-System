import axios from 'axios';

interface FastApiValidationIssue {
  msg?: string;
}

/** Extract a human-readable message from an API error (FastAPI `detail`), network error or exception. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    const detail: unknown = error.response.data?.detail;
    if (typeof detail === 'string' && detail) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as FastApiValidationIssue;
      if (first?.msg) return first.msg.replace(/^Value error, /, '');
    }
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
