const PREFIX = "vbs_";
const SUFFIX = "_protected"; // Makes the string longer

export const encodeId = (id: number | string): string => {
  try {
    const value = `${PREFIX}${id}${SUFFIX}`;
    return btoa(value);
  } catch (e) {
    console.error("Failed to encode ID", e);
    return id.toString();
  }
};

export const decodeId = (encodedId: string | undefined): number | null => {
  if (!encodedId) return null;
  // If it's already a clean number, return it (simple backward compatibility)
  if (!isNaN(Number(encodedId))) return Number(encodedId);

  try {
    const decoded = atob(encodedId);

    // Check for new obfuscated format
    if (decoded.startsWith(PREFIX) && decoded.endsWith(SUFFIX)) {
      const idStr = decoded.slice(PREFIX.length, -SUFFIX.length);
      const num = Number(idStr);
      return isNaN(num) ? null : num;
    }

    // Fallback: Try treating as direct Base64 of a number (legacy)
    const num = Number(decoded);
    return isNaN(num) ? null : num;
  } catch (e) {
    console.warn("Failed to decode ID, returning null", e);
    return null;
  }
};
