const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("We couldn't reach the adoption service. Please try again in a moment.", 0);
  }

  if (response.status === 204) {
    return null;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The adoption service returned an unreadable response.", response.status);
  }
  if (!response.ok) {
    throw new ApiError(payload.message || "Something went wrong. Please try again.", response.status);
  }
  return payload;
}

export function asJson(body) {
  return JSON.stringify(body);
}
