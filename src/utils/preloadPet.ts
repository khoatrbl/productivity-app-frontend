const preloaded = new Set<string>();
let modulePromise: Promise<
  typeof import("../components/PetModel/PetModel")
> | null = null;

/**
 * Warms up the 3D pet in the background: the three.js code, the capybara model,
 * and any cosmetic models given. Safe to call repeatedly; each file is fetched once.
 */
export function preloadPetAssets(cosmeticUrls: string[] = []) {
  // Same import as PetStage's lazy() → the module is downloaded only once
  modulePromise ??= import("../components/PetModel/PetModel");

  const fresh = cosmeticUrls.filter((url) => !preloaded.has(url));
  fresh.forEach((url) => preloaded.add(url));

  modulePromise
    .then((mod) => mod.preloadModels(fresh))
    .catch((err) =>
      console.warn("[preloadPet] Couldn't preload the 3D pet:", err),
    );
}

/** Runs the callback when the browser is idle, so preloading never slows the first screen. */
export function whenIdle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 1500); // Safari has no requestIdleCallback
  return () => clearTimeout(id);
}
