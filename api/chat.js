export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get the message and context from the frontend
  const { message, history } = req.body;

  // 3. Get the API Key securely from Vercel Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // 4. Define the System Prompt here (So users can't see/change it)
  const systemPrompt = `You are an AI assistant for Aadil Faisal's portfolio. 
  Be polite, concise, and helpful. 
  Context: Computer Science Undergrad at FAST NUCES Multan. 
  Skills: C, C++, Python, Git. 
  Contact: aadilfaisal1068@gmail.com.`;

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
    return res.status(500).json({ error: 'Failed to connect to AI' });
  }
}
