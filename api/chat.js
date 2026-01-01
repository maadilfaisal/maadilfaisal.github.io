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
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  // Switched to gemini-2.5-flash-lite as requested
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  // 4. Define the System Prompt here (So users can't see/change it)
  const systemPrompt = `You are an AI assistant for Aadil Faisal's portfolio website. 
  Be polite, concise, and helpful. Answer questions based on this context:
  - Name: Aadil Faisal
  - Role: Computer Science Undergraduate
  - Institution: FAST NUCES Multan (2025-2029)
  - Previous Education: Akhuwat College University Kasur (Intermediate 2023-2025), Jinnah Public High School (Matric).
  - Skills: C, C++, Python (Basic), Git, GitHub, Linux.
  - Hobbies: Chess.
  - Contact: Email (aadilfaisal1068@gmail.com), LinkedIn, GitHub, Instagram.
  If asked something outside this scope, politely say you only know about Aadil's professional profile.`;

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
    
    // 6. Send the answer back to your frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to connect to AI' });
  }
}
