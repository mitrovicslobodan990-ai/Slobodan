import { Router, Request, Response } from "express";

const router = Router();

// Get Giphy API key from environment
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || "";

if (!GIPHY_API_KEY) {
  console.warn("⚠️ GIPHY_API_KEY not set in environment variables");
}

/**
 * Search GIFs on Giphy (via backend to protect API key)
 * GET /gifs/search?q=search+term&limit=20
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q = "", limit = "20" } = req.query;

    if (!GIPHY_API_KEY) {
      return res.status(503).json({
        error: "Giphy service unavailable",
        message: "GIPHY_API_KEY not configured",
      });
    }

    const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(String(q))}&limit=${limit}&rating=g`;

    const response = await fetch(endpoint);
    const data = await response.json() as any;

    // Transform Giphy response to our format
    const gifs = data.data.map((g: any) => ({
      id: g.id,
      url: g.images.fixed_height.url,
      preview: g.images.fixed_height.url,
      title: g.title || g.slug,
    }));

    return res.json({ data: gifs, success: true });
  } catch (error) {
    console.error("❌ GIF search error:", error);
    return res.status(500).json({
      error: "Failed to search GIFs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get trending GIFs from Giphy (via backend to protect API key)
 * GET /gifs/trending?limit=20
 */
router.get("/trending", async (req: Request, res: Response) => {
  try {
    const { limit = "20" } = req.query;

    if (!GIPHY_API_KEY) {
      return res.status(503).json({
        error: "Giphy service unavailable",
        message: "GIPHY_API_KEY not configured",
      });
    }

    const endpoint = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`;

    const response = await fetch(endpoint);
    const data = await response.json() as any;

    // Transform Giphy response to our format
    const gifs = data.data.map((g: any) => ({
      id: g.id,
      url: g.images.fixed_height.url,
      preview: g.images.fixed_height.url,
      title: g.title || g.slug,
    }));

    return res.json({ data: gifs, success: true });
  } catch (error) {
    console.error("❌ GIF trending error:", error);
    return res.status(500).json({
      error: "Failed to fetch trending GIFs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
