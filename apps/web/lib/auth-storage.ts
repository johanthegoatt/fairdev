const AUTH_KEY = "fairdev_auth";

type StoredAuth = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveAuth(accessToken: string, user: { id: string; email: string }): void {
  if (!canUseStorage()) {
    return;
  }

  const payload: StoredAuth = { accessToken, user };
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function clearAuth(): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_KEY);
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed.accessToken;
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredAuth["user"] | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed.user;
  } catch {
    return null;
  }
}