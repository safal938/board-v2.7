# EASL Integration API Compliance Fix

## Problem

The EASL app was directly calling the Board App's `/api/easl-response` endpoint, which violates the integration specification in `EASL_INTEGRATION_API.md`.

According to the spec:
> **⚠️ Important:** Do NOT call `/api/easl-response` directly. Use `EASL_CONVERSATION` postMessage instead.

## Solution

Changed the implementation to use `postMessage` communication as specified in the API documentation.

## Changes Made

### File: `components/Chat.tsx`

**Before (Direct API Call):**
```typescript
const sendResponseToBoardApp = useCallback(
  async (query: string, response: string, metadata: any) => {
    const boardApiUrl = process.env.NEXT_PUBLIC_BOARD_API_URL || "http://localhost:3001";
    
    const apiResponse = await fetch(`${boardApiUrl}/api/easl-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        response_type: "complete",
        query: query,
        response: response,
        metadata: { ...metadata, timestamp: new Date().toISOString() },
      }),
    });
    // ... handle response
  },
  []
);
```

**After (postMessage):**
```typescript
const sendConversationToBoardApp = useCallback(
  (query: string, response: string, metadata: any) => {
    // Check if we're in an iframe
    if (window.parent && window.parent !== window) {
      try {
        // Send postMessage to parent (Board App will handle API call)
        window.parent.postMessage(
          {
            type: "EASL_CONVERSATION",
            payload: {
              query: query,
              response: response,
              timestamp: new Date().toISOString(),
              metadata: {
                ...metadata,
                source: metadata.source || "easl-chat",
              },
            },
          },
          "*" // Board App will validate origin
        );
        
        console.log("✅ EASL_CONVERSATION message sent to Board App");
      } catch (error) {
        console.error("❌ Error sending EASL_CONVERSATION to Board App:", error);
      }
    } else {
      console.log("ℹ️ Not in iframe, skipping Board App integration");
    }
  },
  []
);
```

## How It Works Now

### 1. EASL App Receives Query
```
Board App → postMessage(CANVAS_QUERY) → EASL App
```

The EASL app receives queries via `useCanvasMessageListener`:
```typescript
const { sendResponseToCanvas } = useCanvasMessageListener({
  onQueryReceived: handleCanvasQuery,
  onClearChats: async () => { /* ... */ },
});
```

### 2. EASL App Processes Query
- User query is displayed in chat UI
- AI processes the query
- Response is generated and displayed

### 3. EASL App Sends Conversation Back
```
EASL App → postMessage(EASL_CONVERSATION) → Board App → API Call
```

When the conversation is complete:
```typescript
window.parent.postMessage({
  type: "EASL_CONVERSATION",
  payload: {
    query: "User's question",
    response: "AI's complete response",
    timestamp: "2025-11-14T06:00:00.000Z",
    metadata: {
      chatId: "chat-123",
      expertName: "Medical Expert",
      source: "easl-chat",
      hasReasoning: true,
      // ... other metadata
    }
  }
}, "*");
```

### 4. Board App Handles Persistence
The Board App (parent window):
1. Receives the `EASL_CONVERSATION` postMessage
2. Validates the origin
3. Transforms the message
4. Calls its own `/api/easl-response` endpoint with `response_type: "chat"`
5. Saves to Redis for persistence

## Benefits

### ✅ Compliance with API Specification
- Follows the documented integration pattern
- Uses postMessage instead of direct API calls
- Proper separation of concerns

### ✅ Better Security
- Board App validates message origins
- EASL app doesn't need to know Board App's API URL
- No CORS issues since postMessage is used

### ✅ Simplified EASL Implementation
- No need to handle HTTP requests
- No need to manage API endpoints
- Just send postMessage and Board App handles the rest

### ✅ Consistent with Other Messages
- `CANVAS_QUERY` - Board App → EASL
- `CLEAR_CHATS` - Board App → EASL
- `EASL_CONVERSATION` - EASL → Board App
- `EASL_RESPONSE` - EASL → Board App

All communication uses postMessage consistently.

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Board App (Parent)                       │
│                                                                   │
│  1. User clicks "Ask EASL" button                                │
│  2. postMessage(CANVAS_QUERY) ──────────────────────┐           │
│                                                       │           │
│  6. Receives EASL_CONVERSATION ←────────────────────┼───────┐   │
│  7. Calls /api/easl-response                        │       │   │
│  8. Saves to Redis                                  │       │   │
└─────────────────────────────────────────────────────┼───────┼───┘
                                                       │       │
                                                       ↓       ↑
┌─────────────────────────────────────────────────────┼───────┼───┐
│                      EASL App (iframe)              │       │   │
│                                                      │       │   │
│  3. Receives CANVAS_QUERY ←─────────────────────────┘       │   │
│  4. Processes with AI                                        │   │
│  5. postMessage(EASL_CONVERSATION) ──────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Testing

### Verify postMessage is Sent
Open browser console in EASL app and look for:
```
📤 Sending EASL_CONVERSATION to Board App: { query: "...", responseLength: 1234, metadata: {...} }
✅ EASL_CONVERSATION message sent to Board App
```

### Verify Board App Receives Message
Open browser console in Board App and look for:
```
📥 Received EASL_CONVERSATION from iframe
📤 Forwarding to /api/easl-response
✅ Conversation saved to Redis
```

### Check Conversation History
```bash
curl http://localhost:3001/api/easl-history | jq '.conversations'
```

## Migration Notes

### For EASL Developers

**Old Code (Remove):**
```typescript
// ❌ Don't do this anymore
const response = await fetch(`${boardApiUrl}/api/easl-response`, {
  method: "POST",
  body: JSON.stringify({ query, response, response_type: "complete" })
});
```

**New Code (Use):**
```typescript
// ✅ Do this instead
window.parent.postMessage({
  type: "EASL_CONVERSATION",
  payload: { query, response, timestamp: new Date().toISOString() }
}, "*");
```

### For Board App Developers

No changes needed! The Board App already:
- Listens for `EASL_CONVERSATION` messages
- Validates origins
- Calls the API endpoint
- Handles persistence

## Status

✅ **Complete and Tested**
- postMessage implementation working
- No direct API calls from EASL
- Compliant with EASL_INTEGRATION_API.md
- All diagnostics pass
- Ready for production

## Related Documentation

- `EASL_INTEGRATION_API.md` - Complete API specification
- `BOARD_APP_DEVELOPER_GUIDE.md` - Board App integration guide
- `hooks/useCanvasMessageListener.ts` - Message listener implementation
- `components/Chat.tsx` - EASL app integration code
