import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockJwtVerify = vi.fn();
vi.mock("jose", () => ({
  SignJWT: vi.fn(),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

describe("getSession", () => {
  beforeEach(() => vi.clearAllMocks());

  test("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { getSession } = await import("@/lib/auth");
    expect(await getSession()).toBeNull();
    expect(mockJwtVerify).not.toHaveBeenCalled();
  });

  test("returns the session payload for a valid token", async () => {
    const payload = {
      userId: "user-1",
      email: "user@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    mockCookieStore.get.mockReturnValue({ value: "valid.jwt.token" });
    mockJwtVerify.mockResolvedValue({ payload });

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();

    expect(session).toEqual(payload);
    expect(mockJwtVerify).toHaveBeenCalledOnce();
    expect(mockJwtVerify.mock.calls[0][0]).toBe("valid.jwt.token");
  });

  test("returns null when jwtVerify throws (invalid/expired token)", async () => {
    mockCookieStore.get.mockReturnValue({ value: "bad.jwt.token" });
    mockJwtVerify.mockRejectedValue(new Error("invalid signature"));

    const { getSession } = await import("@/lib/auth");
    expect(await getSession()).toBeNull();
  });
});
