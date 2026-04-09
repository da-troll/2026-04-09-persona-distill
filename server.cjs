/**
 * Persona Distill — Express backend
 * Serves static React build + proxies Claude API calls
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const PORT = process.env.PORT || 3471;
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── API key resolution ────────────────────────────────────────────────────────
// Try ANTHROPIC_API_KEY env first, then fall back to Claude Code OAuth token
function getAnthropicAuth() {
  if (process.env.ANTHROPIC_API_KEY) {
    return { header: 'x-api-key', value: process.env.ANTHROPIC_API_KEY };
  }
  try {
    const credsPath = path.join(process.env.HOME || '/home/eve', '.claude', '.credentials.json');
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
    const token = creds?.claudeAiOauth?.accessToken;
    if (token) return { header: 'Authorization', value: `Bearer ${token}` };
  } catch {}
  return null;
}

// ── Distill endpoint ──────────────────────────────────────────────────────────
app.post('/api/distill', async (req, res) => {
  const { text, name } = req.body;
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Text too short — paste at least a paragraph.' });
  }

  const auth = getAnthropicAuth();
  if (!auth) return res.status(500).json({ error: 'No Anthropic API credentials found.' });

  const systemPrompt = `You are an expert at distilling cognitive fingerprints from text. Analyze writing samples and extract the essence of how a person thinks, reasons, and communicates.`;

  const userPrompt = `Analyze the following text${name ? ` written by ${name}` : ''} and extract a precise persona distillation. Return ONLY valid JSON with this exact structure:

{
  "name": "${name || 'Unknown Thinker'}",
  "tagline": "One sentence capturing their intellectual identity",
  "coreBeliefs": ["belief 1", "belief 2", "belief 3", "belief 4"],
  "mentalModels": [
    { "name": "Model name", "description": "How they apply it" }
  ],
  "communicationStyle": {
    "tone": "e.g. direct, playful, rigorous",
    "structure": "e.g. builds from first principles, uses analogies",
    "signature": "Their most distinctive linguistic habit"
  },
  "thinkingPatterns": ["pattern 1", "pattern 2", "pattern 3"],
  "wouldPushBackOn": ["thing they'd challenge 1", "thing they'd challenge 2"],
  "characteristicPhrases": ["phrase or expression 1", "phrase or expression 2", "phrase or expression 3"],
  "systemPrompt": "A ~200 word system prompt that would make Claude respond in this person's thinking style. Be specific about their reasoning approach, values, and communication patterns. Do NOT claim to be the actual person — frame as 'a thinker who...' or 'you reason like X...'"
}

TEXT TO ANALYZE:
${text.slice(0, 8000)}`;

  try {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const result = await callAnthropic(auth, body);
    const content = result?.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse distillation response.' });

    const persona = JSON.parse(jsonMatch[0]);
    res.json({ persona });
  } catch (err) {
    console.error('Distill error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Chat endpoint (streaming) ─────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, personaName } = req.body;
  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: 'Missing messages or systemPrompt.' });
  }

  const auth = getAnthropicAuth();
  if (!auth) return res.status(500).json({ error: 'No Anthropic API credentials found.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const body = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    stream: true,
    system: systemPrompt,
    messages: messages.slice(-10), // keep last 10 for context
  });

  try {
    await streamAnthropic(auth, body, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── Anthropic HTTP helpers ────────────────────────────────────────────────────
function callAnthropic(auth, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        [auth.header]: auth.value,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function streamAnthropic(auth, body, onChunk) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15',
        [auth.header]: auth.value,
      },
    }, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              onChunk(event.delta.text);
            }
          } catch {}
        }
      });
      res.on('end', resolve);
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Serve static React build ──────────────────────────────────────────────────
const distPath = path.join(__dirname, 'out');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[persona-distill] Server running on port ${PORT}`);
});
