// Vercel Analytics (disabled for static build to avoid module resolution errors)
(async () => {
  try {
    // Attempt to load the lightweight browser bundle from the CDN
    const { inject } = await import(
      "https://unpkg.com/@vercel/analytics@1.3.1/dist/analytics.browser.js"
    );
    inject();
  } catch (error) {
    // Fall back gracefully when running without a bundler
    console.info(
      "Vercel Analytics not loaded (static build):",
      error?.message || error
    );
  }
})();
