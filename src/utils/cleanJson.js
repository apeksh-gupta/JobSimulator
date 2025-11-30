export const cleanJsonString = (text) => {
  if (!text) return "{}";

  // Remove markdown fences like ```json or ```
  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Extract only the JSON part between the first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("JSON object not found in AI response");
  }

  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  return cleaned;
};
