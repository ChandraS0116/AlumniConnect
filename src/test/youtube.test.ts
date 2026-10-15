import { describe, it, expect } from "vitest";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "../lib/youtube";

describe("YouTube Utility", () => {
  it("should extract video ID from standard watch URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=fMZMm_0ZhK4")).toBe("fMZMm_0ZhK4");
  });

  it("should extract video ID from youtu.be shortlink", () => {
    expect(extractYouTubeId("https://youtu.be/fMZMm_0ZhK4")).toBe("fMZMm_0ZhK4");
  });

  it("should extract video ID from embed URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/fMZMm_0ZhK4")).toBe("fMZMm_0ZhK4");
  });

  it("should accept raw 11-character video ID", () => {
    expect(extractYouTubeId("fMZMm_0ZhK4")).toBe("fMZMm_0ZhK4");
  });

  it("should generate privacy-friendly embed URL with autoplay", () => {
    const embed = getYouTubeEmbedUrl("https://www.youtube.com/watch?v=fMZMm_0ZhK4");
    expect(embed).toContain("https://www.youtube-nocookie.com/embed/fMZMm_0ZhK4");
    expect(embed).toContain("autoplay=1");
  });

  it("should return high-quality thumbnail URL", () => {
    expect(getYouTubeThumbnailUrl("fMZMm_0ZhK4")).toBe("https://img.youtube.com/vi/fMZMm_0ZhK4/hqdefault.jpg");
  });

  it("should return null for invalid inputs", () => {
    expect(extractYouTubeId("")).toBeNull();
    expect(extractYouTubeId("not-a-link")).toBeNull();
  });
});
