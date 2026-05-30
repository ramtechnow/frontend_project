describe("BACKEND_URL configuration", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  test("should resolve to http://localhost:4000 if hostname is localhost", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
      configurable: true
    });
    
    const { BACKEND_URL: url } = require("./config");
    expect(url).toBe("http://localhost:4000");
  });

  test("should resolve to https://frontend-project-jucn.onrender.com if hostname is a deployed domain", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "ecommerce-website-dfd55.web.app" },
      writable: true,
      configurable: true
    });

    const { BACKEND_URL: url } = require("./config");
    expect(url).toBe("https://frontend-project-jucn.onrender.com");
  });
});
