module.exports = async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return response.status(503).json({ error: 'Groq AI is not configured' });

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const mode = body?.mode === 'radar' ? 'radar' : 'deep';
    const serialized = JSON.stringify(body?.payload || {}).slice(0, 12000);
    const task = mode === 'radar'
      ? 'Анализирай текущото оправдание спрямо личната история. Посочи конкретно броя сходни случаи и колко пъти реалното количество е било над планираното, само ако данните го доказват.'
      : 'Открий най-полезните повтарящи се връзки между настроение, причина, желание, последствия и разлика между планирано и реално количество.';

    const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        temperature: 0.2,
        max_completion_tokens: 350,
        messages: [
          {
            role: 'system',
            content: 'Ти си внимателен помощник в приложение за намаляване на вредата от алкохол. Отговаряй на български в максимум 90 думи. Не диагностицирай, не засрамвай, не измисляй статистика и не представяй предположения като факти. Използвай само предоставените записи. Ако данните са малко, кажи го ясно. При признаци за непосредствен риск препоръчай 112 или медицинска помощ.'
          },
          {
            role: 'user',
            content: `${task}\n\nАнонимизирани локални данни:\n${serialized}`
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      const message = await apiResponse.text();
      console.error('Groq error', apiResponse.status, message.slice(0, 500));
      return response.status(502).json({ error: 'AI request failed' });
    }

    const result = await apiResponse.json();
    const analysis = result.choices?.[0]?.message?.content || '';
    return response.status(200).json({ analysis });
  } catch (error) {
    console.error('AI endpoint error', error);
    return response.status(500).json({ error: 'Unexpected AI error' });
  }
};
