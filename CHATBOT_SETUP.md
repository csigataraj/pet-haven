# AI Chatbot Setup Guide

## Overview

The AI chatbot feature has been integrated into your Angular app with a floating button in the bottom-right corner. It helps customers with product recommendations and pet supply questions.

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign in or create an account
3. Navigate to **API keys** section
4. Click **Create new secret key**
5. Copy the generated key (you'll only see it once!)

### 2. Configure Environment Variable

Create a `.env` file in the project root (same level as `package.json`):

```bash
OPENAI_API_KEY=sk_your_actual_api_key_here
```

Or set it as an environment variable before running:

**On macOS/Linux:**
```bash
export OPENAI_API_KEY=sk_your_actual_api_key_here
npm run start:full
```

**On Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk_your_actual_api_key_here"
npm run start:full
```

**On Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk_your_actual_api_key_here
npm run start:full
```

### 3. Install Dependencies

The OpenAI package has been added to `package.json`. Install it:

```bash
npm install
```

### 4. Start the App

Run both the Angular frontend and mock backend together:

```bash
npm run start:full
```

This starts:
- Angular dev server on `http://localhost:4200`
- Mock backend with OpenAI integration on `http://localhost:3001`

### 5. Test the Chatbot

1. Open the app in your browser: `http://localhost:4200`
2. Look for the blue **Chat** button in the bottom-right corner
3. Click it to open the chat window
4. Type a product question like: "I need recommendations for cat toys"
5. The chatbot will respond with helpful suggestions

## Features

- **Floating Button**: Fixed position on bottom-right, non-intrusive
- **Conversation History**: Maintains context across multiple messages
- **Loading Indicator**: Shows typing animation while waiting for AI response
- **Responsive Design**: Works on mobile and desktop
- **Internationalized**: Supports English and French (via language switcher)
- **Error Handling**: Gracefully handles API failures with user-friendly messages

## Backend Endpoint

The backend exposes one endpoint:

**POST** `http://localhost:3001/api/chatbot/message`

Request body:
```json
{
  "message": "User's message",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

Response:
```json
{
  "reply": "Assistant's response",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

## Troubleshooting

### "OpenAI API key not configured"
- Ensure your API key is set as an environment variable
- Restart the servers after setting the environment variable
- Check that the `.env` file is in the root directory (if using that approach)

### "Failed to connect to backend"
- Verify mock backend is running on port 3001: `npm run mock:server`
- Check that `proxy.conf.json` is correctly routing `/api` requests
- Look for any firewall issues blocking localhost:3001

### Chatbot returns an error
- Check the browser console (F12 → Console) for error details
- Verify your OpenAI API key is valid and has credits
- Ensure your account has access to `gpt-3.5-turbo` model

## Customization

### Change the AI Model

Edit `mock-server/server.js` and change the `model` field:

```javascript
model: 'gpt-3.5-turbo',  // or 'gpt-4' for better responses (costs more)
```

### Change System Prompt

Edit the system prompt in `mock-server/server.js`:

```javascript
content: `Your custom system prompt here...`
```

### Styling

The chatbot component styling is in `src/app/shared/components/chatbot/chatbot.component.ts`. Modify the `styles` section to change colors, sizes, animations, etc.

## File Structure

```
src/app/
├── core/
│   └── services/
│       └── chatbot.service.ts          // Frontend service for API calls
├── shared/
│   └── components/
│       └── chatbot/
│           └── chatbot.component.ts    // UI component
└── app.component.ts                     // Updated to include chatbot

mock-server/
└── server.js                            // Backend endpoint added
```

## Next Steps

- Customize the system prompt to match your business needs
- Add product catalog context to make recommendations more specific
- Consider rate limiting to prevent API abuse
- Monitor OpenAI usage costs in your account dashboard
- Add authentication/user tracking if needed for analytics
