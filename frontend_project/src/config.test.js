describe("BACKEND_URL configuration", () => {
  const originalLocation = window.location;
  const originalEnvUrl = process.env.REACT_APP_BACKEND_URL;

  beforeEach(() => {
    jest.resetModules();
    // Delete env variable so runtime hostname detection can be tested
    delete process.env.REACT_APP_BACKEND_URL;
  });

  afterEach(() => {
    process.env.REACT_APP_BACKEND_URL = originalEnvUrl;
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

  test("should use REACT_APP_BACKEND_URL if specifically set in process.env", () => {
    process.env.REACT_APP_BACKEND_URL = "https://custom-backend.com";
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" }, // Even if localhost, env variable should override
      writable: true,
      configurable: true
    });

    const { BACKEND_URL: url } = require("./config");
    expect(url).toBe("https://custom-backend.com");
  });
});
