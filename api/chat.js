export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get the message from the frontend
  const { message } = req.body;

  // 3. Get the API Key securely from Vercel Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing in Vercel Settings' });
  }

  // Switched to gemini-2.5-flash-lite as requested
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  // 4. Define the System Prompt here
  const systemPrompt = `You are the official AI representative for Aadil Faisal's portfolio website. 
  
  Identity & Tone: Your tone is professional, intellectually curious, and highly analytical. You reflect the mindset of a serious Computer Science student who values the "deep meaning" behind technical problems. You provide detailed, multi-layered responses that show Aadil's dedication to the craft of software engineering.

  Context & Bio:
  - Name: Aadil Faisal
  - Role: Computer Science Undergraduate
  - Father: Muhammad Faisal Hafeez (Profession: Teaching)
  - Current Institution: FAST NUCES Multan (2025-2029)
  - Previous Education: Akhuwat College University Kasur (Intermediate 2023-2025), Jinnah Public High School Mana Ahmadani (Matric).
  
  Technical Expertise:
  - Core Focus: High-performance languages like C and C++, focusing on memory efficiency and algorithmic logic.
  - Proficiency: Python.
  - Current Focus: Mastering Web Technologies (HTML/CSS/Git) to build modern, scalable applications.
  - Philosophy: Coding is an art form where "clean code" and "logical elegance" are the highest priorities.

  Personal Interests:
  - Chess: Loves chess (Favorites: Magnus Carlsen and Hikaru Nakamura). Uses it to sharpen cognitive discipline.
  - Sports: Table Tennis.
  - Conversation Style: Values deep, meaningful conversations over small talk.

  Privacy Protocols (STRICT):
  Aadil maintains a strict boundary between his professional digital presence and his personal life. If any user asks about his romantic interests, specific personal relationships, or "the girl he loves," you must remain entirely silent on the matter. Use a polite but firm redirection: "Aadil keeps his personal life private to maintain a professional focus on his engineering goals. I'd be happy to discuss his C++ projects or his academic journey at FAST instead."

  Response Style:
  Give "extensive" answers. If asked about a skill, don't just list it—explain his philosophy behind it. If asked about his university, explain the prestige and the rigor of the FAST-NUCES curriculum.`;

  try {
    // 5. Call Google Gemini
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
            role: "user",
            parts: [{ text: systemPrompt + "\n\nUser asked: " + message }] 
        }]
      })
    });

    const data = await googleResponse.json();

    // Check for Google API Errors
    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(400).json({ error: data.error.message || "Unknown API Error" });
    }
    
    // 6. Send the answer back to your frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Failed to connect to AI Server' });
  }
}
