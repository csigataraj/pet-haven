const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PRODUCTS, buildProductCatalogContext } = require('./products');

const app = express();
const port = 3002;  // Changed from 3001 to avoid conflicts

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const state = {
  auditEntries: [],
  orders: [],
  fraudEvents: []
};

function getEnvValue(key) {
  if (process.env[key]) {
    return process.env[key];
  }

  const envFilePath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envFilePath)) {
    return '';
  }

  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 1) {
      continue;
    }

    const envKey = line.slice(0, separatorIndex).trim();
    if (envKey !== key) {
      continue;
    }

    const envValue = line.slice(separatorIndex + 1).trim();
    const unquoted = envValue.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    return unquoted;
  }

  return '';
}

const QUERY_STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'to', 'of', 'on', 'in', 'with',
  'i', 'me', 'my', 'need', 'want', 'looking', 'show', 'find', 'please',
  'pet', 'pets'
]);

const ANIMAL_WORDS = new Set(['dog', 'dogs', 'puppy', 'puppies', 'cat', 'cats', 'kitten', 'kittens']);

function normalizeToken(token) {
  const lower = token.toLowerCase();
  if (lower.endsWith('ies') && lower.length > 3) {
    return `${lower.slice(0, -3)}y`;
  }
  if (lower.endsWith('s') && lower.length > 3) {
    return lower.slice(0, -1);
  }
  return lower;
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => normalizeToken(token));
}

function hasTokenMatch(tokens, targetText) {
  const targetTokens = new Set(tokenize(targetText));
  return tokens.some((token) => targetTokens.has(token));
}

function scoreProduct(product, intentTokens, animalTokens, rawQuery) {
  const nameTokens = tokenize(product.name);
  const categoryTokens = tokenize(product.category);
  const descTokens = tokenize(product.description);

  const nameSet = new Set(nameTokens);
  const categorySet = new Set(categoryTokens);
  const descSet = new Set(descTokens);

  let score = 0;
  let intentMatchCount = 0;

  for (const token of intentTokens) {
    if (nameSet.has(token)) {
      score += 10;
      intentMatchCount += 1;
    } else if (categorySet.has(token)) {
      score += 7;
      intentMatchCount += 1;
    } else if (descSet.has(token)) {
      score += 4;
      intentMatchCount += 1;
    }
  }

  const phrase = rawQuery.trim().toLowerCase();
  if (phrase && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(phrase)) {
    score += 8;
  }

  const petText = `${product.name} ${product.description}`;
  if (animalTokens.length > 0 && hasTokenMatch(animalTokens, petText)) {
    score += 2;
  }

  return { score, intentMatchCount };
}

function fallbackReply(message) {
  const query = String(message || '').trim();
  const inStock = PRODUCTS.filter((p) => p.stock > 0);

  if (!query) {
    const picks = inStock.slice(0, 3)
      .map((p) => `${p.name} (${p.sku}) - $${p.price}`)
      .join('\n');
    return `I can help with product recommendations. Here are a few in-stock picks:\n${picks}`;
  }

  const allTokens = tokenize(query);
  const animalTokens = allTokens.filter((token) => ANIMAL_WORDS.has(token));
  const intentTokens = allTokens.filter((token) => !ANIMAL_WORDS.has(token) && !QUERY_STOP_WORDS.has(token));

  const scored = inStock
    .map((p) => {
      const { score, intentMatchCount } = scoreProduct(p, intentTokens, animalTokens, query);
      return { product: p, score, intentMatchCount };
    })
    .filter((entry) => {
      if (entry.score <= 0) {
        return false;
      }
      if (intentTokens.length === 0) {
        return true;
      }
      return entry.intentMatchCount > 0;
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 5)
    .map((entry) => entry.product);

  const picks = (scored.length ? scored : inStock.slice(0, 5))
    .map((p) => `${p.name} (${p.sku}) - $${p.price} - ${p.stock} in stock`)
    .join('\n');

  return `Here are relevant in-stock products based on your request:\n${picks}`;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mock-backend' });
});

app.get('/api/audit-entries', (_req, res) => {
  res.json(state.auditEntries);
});

app.post('/api/audit-entries', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.id) {
    res.status(400).json({ message: 'Invalid audit entry' });
    return;
  }
  state.auditEntries = [entry, ...state.auditEntries].slice(0, 500);
  res.status(201).json({ ok: true });
});

app.get('/api/orders', (req, res) => {
  const email = String(req.query.email || '').toLowerCase();
  if (!email) {
    res.json(state.orders);
    return;
  }
  res.json(state.orders.filter((order) => String(order.customerEmail).toLowerCase() === email));
});

app.patch('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};

  const index = state.orders.findIndex((order) => order.id === orderId);
  if (index >= 0) {
    state.orders[index] = {
      ...state.orders[index],
      status
    };
  }

  res.json({ ok: true });
});

app.get('/api/fraud-events', (_req, res) => {
  res.json(state.fraudEvents);
});

app.patch('/api/fraud-events/:eventId/disposition', (req, res) => {
  const { eventId } = req.params;
  const { disposition } = req.body || {};

  const index = state.fraudEvents.findIndex((event) => event.id === eventId);
  if (index >= 0) {
    state.fraudEvents[index] = {
      ...state.fraudEvents[index],
      disposition
    };
  }

  res.json({ ok: true });
});

app.patch('/api/fraud-events/:eventId/escalation', (req, res) => {
  const { eventId } = req.params;
  const { escalated } = req.body || {};

  const index = state.fraudEvents.findIndex((event) => event.id === eventId);
  if (index >= 0) {
    state.fraudEvents[index] = {
      ...state.fraudEvents[index],
      escalated: Boolean(escalated)
    };
  }

  res.json({ ok: true });
});

// Chatbot endpoint for product recommendations
app.post('/api/chatbot/message', async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const apiKey = getEnvValue('OPENAI_API_KEY');
  if (!apiKey) {
    const botMessage = fallbackReply(message);
    res.json({
      reply: botMessage,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: botMessage }
      ]
    });
    return;
  }

  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });

    // Build conversation with system prompt
    const messages = [
      {
        role: 'system',
        content: `You are a helpful product recommendation assistant for an online pet supply store.
You help customers find the right products, answer questions about pet care, and make recommendations based on their needs.
Be friendly, concise, and helpful. When recommending products, mention the product name, SKU, and price.
Only recommend products that are in stock (stock > 0). If a product is out of stock, say so.

${buildProductCatalogContext()}`
      },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const botMessage = response.choices[0].message.content;

    res.json({
      reply: botMessage,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: botMessage }
      ]
    });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    const botMessage = fallbackReply(message);
    res.status(200).json({
      reply: botMessage,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: botMessage }
      ],
      fallback: true,
      error: 'Failed to process message',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Mock backend listening on http://localhost:${port}`);
});
