import { GoogleGenerativeAI } from '@google/generative-ai';

// Emergency Fallback List
const LOCAL_BAD_WORDS = ['scam', 'free money', '100% profit', 'guaranteed returns', 'ponzi', 'asdfasdf'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ safe: false, reason: 'Method not allowed' });
  }

  const { title, description } = req.body;
  const incomingSnippet = `${title || ''} ${description || ''}`.substring(0, 30);
  console.log(`[Moderation] Incoming request snippet: "${incomingSnippet}..."`);

  if (!title || !description || title.trim().length < 3 || description.trim().length < 10) {
    return res.status(200).json({ safe: false, reason: 'Input is too short. Title needs 3+ chars, Description 10+ chars.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("DEBUG: Key starts with:", apiKey?.substring(0, 4) || 'UNDEFINED');
  
  if (!apiKey) {
    console.error('[MODERATION_ERROR] No Gemini API key provided.');
    return res.status(500).json({ safe: false, reason: 'API_ERROR: Moderation skipped (no API key)' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = `You are a Helpful Project Mentor checking crowdfunding proposals. 
Analyze the INTENT. Short descriptions are acceptable if they clearly state a project goal. 
Only block actual scams, illegal content, phishing, or repetitive gibberish. Keywords like 'free money', 'guaranteed', 'scam', or '100% profit' should heavily flag a project. 
If you reject a project, you MUST provide a constructive tip on how the user can improve their text in the "reason" field (e.g., "Please add more details about how the money will be spent").
Force Gemini to return ONLY a raw JSON object: {"safe": boolean, "reason": "string"}. Do not use markdown blocks, do not include any introductory text, only the JSON object.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
    const content = `Project Title: ${title}\n\nProject Description: ${description}`;

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    const apiCallPromise = model.generateContent({ contents: [{ role: 'user', parts: [{ text: content }] }] });

    const result = await Promise.race([apiCallPromise, timeoutPromise]);

    // TASK 1: Gemini Safety Handling
    let rawText = '';
    try {
      const response = await result.response;
      rawText = response.text().trim();
    } catch (responseError) {
      console.warn('[MODERATION] Blocked by Gemini Safety Filters:', responseError.message);
      return res.status(200).json({ safe: false, reason: 'Content flagged by AI safety filters.' });
    }

    // TASK 1: Detailed Logging
    console.log(`DEBUG: Raw Gemini response type: ${typeof rawText}, length: ${rawText.length}`);
    console.log("DEBUG: Raw Gemini Response:", rawText);

    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    // TASK 1: Advanced JSON Extraction
    let parsedResponse;
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const cleanedJson = rawText.substring(jsonStart, jsonEnd + 1);
      try {
        parsedResponse = JSON.parse(cleanedJson);
      } catch (e) {
        console.warn('[MODERATION] JSON parse failed on extracted block:', cleanedJson);
        throw new Error('JSON Parsing Failed');
      }
    } else {
      // Manual construct fallback
      const lowerText = rawText.toLowerCase();
      if (lowerText.includes('unsafe') || lowerText.includes('false')) {
        parsedResponse = { safe: false, reason: 'AI deemed content unsafe but parsing failed.' };
      } else if (lowerText.includes('safe') || lowerText.includes('true')) {
        parsedResponse = { safe: true, reason: 'AI deemed content safe but parsing failed.' };
      } else {
        throw new Error('Gemini did not return a valid JSON object or understandable boolean.');
      }
    }

    const isSafe = !!parsedResponse?.safe;
    const decisionReason = parsedResponse?.reason || 'Analyzed by Security Guard';
    
    console.log(`[Moderation] AI Decision: ${isSafe ? 'SAFE' : 'BLOCKED'} | Reason: ${decisionReason}`);
    return res.status(200).json({ safe: isSafe, reason: decisionReason });

  } catch (error) {
    console.error(`[MODERATION_ERROR] Full error object:`, error);
    
    // TASK 1: Emergency Fallback
    console.warn('[MODERATION] Falling back to local keyword check due to API failure...');
    const combinedContent = `${title} ${description}`.toLowerCase();
    const hasBadWord = LOCAL_BAD_WORDS.some(word => combinedContent.includes(word));

    if (hasBadWord) {
      console.log(`[Moderation] Local Fallback BLOCKED content.`);
      return res.status(200).json({ safe: false, reason: 'Blocked by local security fallback.' });
    } else {
      console.log(`[Moderation] Local Fallback ALLOWED content.`);
      return res.status(200).json({ safe: true, reason: 'Passed local security fallback (API was down).' });
    }
  }
}
