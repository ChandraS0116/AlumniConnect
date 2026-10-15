/**
 * Helper to extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already a clean 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://www.youtube.com/watch?feature=player_embedded&v=VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Returns the embed URL for a YouTube video
 */
export function getYouTubeEmbedUrl(urlOrId?: string): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * Returns a high-res thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnailUrl(urlOrId?: string): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
