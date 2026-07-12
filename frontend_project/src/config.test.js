import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("BACKEND_URL configuration", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  it("uses the local API while developing locally", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
      configurable: true
    });

    const { BACKEND_URL } = await import("./config");
    expect(BACKEND_URL).toBe("http://localhost:4000");
  });

  it("uses the production backend by default", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "ecommerce-website-dfd55.web.app" },
      writable: true,
      configurable: true
    });

    const { BACKEND_URL } = await import("./config");
    expect(BACKEND_URL).toBe("https://ecommerce-backend.onrender.com");
  });

  it("uses VITE_BACKEND_URL when configured by the host", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://custom-backend.com/");

    const { BACKEND_URL } = await import("./config");
    expect(BACKEND_URL).toBe("https://custom-backend.com");
  });
});
