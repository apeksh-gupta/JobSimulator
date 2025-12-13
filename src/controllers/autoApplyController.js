import { UserProfile } from "../models/userProfile.js";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const MapFieldsSchema = z.object({
  scan: z.any(),
  userId: z.string().nullable().optional()
});

export async function mapFieldsController(req, res) {
  try {
    const parsed = MapFieldsSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.errors });

    const { scan, userId } = parsed.data;

    let profile = null;
    if (userId) {
      profile = await UserProfile.findById(userId)
        .lean()
        .select("-__v -createdAt -updatedAt")
        .exec();
    }

    const prompt = buildMappingPrompt(scan, profile);
    const result = await geminiModel.generateContent(prompt);
    const textOutput = result.response.text();

    if (!textOutput) {
      return res.status(500).json({ error: "empty_model_response", raw: result });
    }

    const json = extractJSON(textOutput);
    if (!json || !Array.isArray(json)) {
      return res.status(500).json({ error: "could_not_parse_model_output", raw: textOutput });
    }

    const mapping = json.map((m) => sanitizeMappingEntry(m));
    return res.json({ mapping });
  } catch (err) {
    console.error("mapFieldsController ERROR:", err);
    return res.status(500).json({ error: String(err) });
  }
}

export async function updateStatusController(req, res) {
  const { userId, jobUrl, status, note } = req.body;
  console.log("update-status", { userId, jobUrl, status, note });
  return res.json({ ok: true });
}

/* -------------------- Helpers -------------------- */

function buildMappingPrompt(scan, profile) {
  const safeProfile = profile
    ? {
        name: profile.name || null,
        email: profile.email || null,
        phone: profile.phone || profile.mobile || null,
        job_title: profile.job_title || null,
        company: profile.company || null,
        resumeUrl: profile.resumeUrl || null
      }
    : null;

  const fieldsFlatten = [];
  (scan.forms || []).forEach((f) => {
    (f.fields || []).forEach((field) =>
      fieldsFlatten.push({
        fieldId: field.fieldId,
        name: field.name,
        id: field.id,
        type: field.type,
        tag: field.tag,
        label: field.label,
        placeholder: field.placeholder,
        ariaLabel: field.ariaLabel,
        title: field.title,
        autocomplete: field.autocomplete,
        options: field.options,
        cssSelector: field.cssSelector || null
      })
    );
  });

  const instruction = `
You are a precise, non-hallucinating form mapping engine.

Your job:
Map webpage fields ONLY when the field label, placeholder, name, id, title, or aria-label clearly matches a known profile key.

STRICT OUTPUT RULES:
---------------------------------------------
Valid mapped_key values:
- name
- given_name
- family_name
- email
- phone
- dob
- job_title
- company
- address.line1
- address.city
- address.postal_code
- resumeUrl

If the field does NOT clearly match any above key:
→ mapped_key = "custom"
→ value = null
→ confidence = 0.1

ABSOLUTELY FORBIDDEN:
---------------------------------------------
- DO NOT guess fields like:
  legalName.*, phoneNumber.*, address.addressLine2/3
  candidateIsPreviousWorker, howDidYouHearAboutUs
  or ANY custom HR fields.

- NEVER invent new profile keys.
- NEVER create nested objects beyond address.*.
- NEVER hallucinate.

WHEN TO MAP:
---------------------------------------------
Email fields → label/title/aria-label contains "email"
Phone fields → label/title/aria-label contains "phone", "mobile"
Name fields:
  "first name" → given_name
  "last name" → family_name
  only "name" → name

Resume fields:
  label/title/aria-label contains "resume", "upload CV", "attach" → resumeUrl

VALUE RULES:
---------------------------------------------
- Use ONLY provided profile values.
- If profile is missing a value, set value: null.
- transformation should be null unless absolutely required.

OUTPUT FORMAT:
---------------------------------------------
Return ONLY a pure JSON array:
[
  {
    "fieldId": "...",
    "mapped_key": "...",
    "value": "...",
    "transformation": null,
    "confidence": 0.95,
    "reason": "short explanation"
  }
]
---------------------------------------------
`;

  return `
### USER PROFILE
${JSON.stringify(safeProfile, null, 2)}

### FIELDS
${JSON.stringify(fieldsFlatten, null, 2)}

### INSTRUCTIONS
${instruction}

ONLY return valid JSON. No markdown. No backticks. No commentary.
`;
}

function extractJSON(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return null;

  const jsonStr = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    try {
      return JSON.parse(jsonStr.replace(/,\s*]/g, "]"));
    } catch {
      return null;
    }
  }
}

function sanitizeMappingEntry(m) {
  return {
    fieldId: m.fieldId || null,
    mapped_key: m.mapped_key || "custom",
    value: m.value ?? null,
    transformation: m.transformation || null,
    confidence:
      typeof m.confidence === "number"
        ? Math.max(0, Math.min(1, m.confidence))
        : 0.1,
    reason: m.reason || ""
  };
}
