export async function generateGeminiReply({ messages, language, model }) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Gemini API key');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemText = language === 'hindi'
    ? 'आप एक सरल सहायक हैं जो मजदूर/श्रमिक लोगों को सरकारी योजनाओं (खासकर MGNREGA/मनरेगा) के बारे में आसान भाषा में बताता है। जवाब छोटा रखें। अगर यूज़र का जिला/राज्य नहीं पता हो तो पूछें। जहाँ जरूरत हो वहाँ 2-4 स्टेप्स में बताएं।'
    : 'You are a simple helper for labour workers to understand government schemes (especially MGNREGA). Keep answers short and easy. If state/district is missing, ask. When needed, explain in 2-4 steps.';

  const contents = (Array.isArray(messages) ? messages : [])
    .filter(m => m && typeof m.text === 'string' && m.text.trim().length > 0)
    .slice(-16)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

  const body = {
    systemInstruction: {
      parts: [{ text: systemText }]
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detailsText = '';
    let detailsJson = null;
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        detailsJson = await res.json();
      } else {
        detailsText = await res.text();
      }
    } catch {
      detailsText = '';
      detailsJson = null;
    }

    const apiMessage =
      (typeof detailsJson?.error?.message === 'string' && detailsJson.error.message.trim())
        ? detailsJson.error.message.trim()
        : (detailsText || '').trim();

    const err = new Error(
      apiMessage
        ? `Gemini request failed (${res.status}): ${apiMessage}`
        : `Gemini request failed (${res.status})`
    );
    err.status = res.status;
    err.details = detailsJson || detailsText;
    throw err;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map(p => (typeof p?.text === 'string' ? p.text : '')).join('')
    : '';

  return (text || '').trim();
}
