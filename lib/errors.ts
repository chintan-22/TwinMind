export interface ApiErrorResponse {
  error?: string;
}

export function getErrorMessage(
  error: unknown,
  fallback: string = "Unknown error"
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}

export function hasStatusCode(error: unknown, statusCode: number): boolean {
  return getErrorMessage(error, "").includes(String(statusCode));
}

export async function readApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error || fallback;
  } catch {
    return fallback;
  }
}
