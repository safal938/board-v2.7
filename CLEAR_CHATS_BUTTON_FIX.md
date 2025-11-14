# Clear Chats Button Fix

## Problem
The "Clear Chats" button was not visible in the easl-chatbot-zone because it didn't exist in the board items data.

## Solution
Added a new button item to both board items files:

### Button Configuration
```json
{
  "id": "easl-clear-chats-button",
  "type": "button",
  "x": 2700,
  "y": 8350,
  "width": 200,
  "height": 45,
  "buttonText": "Clear Chats",
  "buttonIcon": "🗑️",
  "buttonColor": "#dc2626",
  "buttonAction": "clearChats",
  "createdAt": "2025-11-14T12:00:00.000Z",
  "updatedAt": "2025-11-14T12:00:00.000Z"
}
```

### Location
- **Zone:** easl-chatbot-zone (Guideline Assistant Zone)
- **Position:** Below the EASL iframe (x: 2700, y: 8350)
- **Size:** 200px wide × 45px tall
- **Color:** Red (#dc2626) to indicate destructive action

### Files Updated
1. `api/data/boardItems.json` - Backend data source
2. `src/data/boardItems.json` - Frontend fallback data

## How It Works

When clicked, the button:
1. Shows a confirmation modal
2. Sends `CLEAR_CHATS` postMessage to EASL iframe
3. Calls `/api/easl-reset` to clear conversation history in Redis
4. Logs the number of conversations cleared

## Testing

After reloading the board:
1. Navigate to the easl-chatbot-zone
2. You should see a red "🗑️ Clear Chats" button below the EASL iframe
3. Click it to test the clear functionality
4. Confirm in the modal
5. Check console for: `✅ Conversation history cleared: X conversations removed`

## Next Steps

If you need to adjust the button position:
- Modify the `x` and `y` coordinates in both JSON files
- The current position (2700, 8350) places it directly below the iframe
- EASL iframe is at (2700, 7100) with height 1200, so button is at 7100 + 1200 + 50 = 8350
