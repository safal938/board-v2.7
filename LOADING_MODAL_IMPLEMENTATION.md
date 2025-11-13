# Loading Modal Implementation for DILI Diagnostic and Patient Report

## Summary
Implemented loading modals with button disabled states for DILI Diagnostic and Patient Report generation, with automatic focus and navigation to newly created items.

## Changes Made

### 1. AlertModal Component (`src/components/AlertModal.tsx`)

**Added Loading Type Support:**
- Added `'loading'` to the type union: `'success' | 'error' | 'warning' | 'info' | 'loading'`
- Imported `Loader2` icon from lucide-react
- Added spinner animation CSS for the loading icon
- Updated `getIcon()` to return spinning `Loader2` for loading type
- Updated `getTitle()` to return "Processing" for loading type
- Disabled modal close on overlay click when type is 'loading'
- Hidden close button and OK button when type is 'loading'

**Loading Modal Features:**
- Animated spinner icon
- Cannot be dismissed by user (no close button, no overlay click)
- Automatically closes when processing completes

### 2. BoardItem Component (`src/components/BoardItem.tsx`)

**Added Loading State:**
- Added `isProcessing` state to track button processing status
- Updated `alertModal` type to include `'loading'`

**Button Click Handlers Updated:**

**Generate DILI Diagnosis:**
- Shows loading modal: "Generating DILI Diagnosis... Please wait."
- Sets `isProcessing` to true
- Calls `/api/dili-diagnostic` with `zone: 'dili-analysis-zone'`
- Closes modal on success (SSE handles navigation)
- Shows error modal on failure
- Resets `isProcessing` state

**Generate Patient Report:**
- Shows loading modal: "Generating Patient Report... Please wait."
- Sets `isProcessing` to true
- Calls `/api/patient-report` with `zone: 'patient-report-zone'`
- Closes modal on success (SSE handles navigation)
- Shows error modal on failure
- Resets `isProcessing` state

**Button Disabled State:**
- Button is disabled when `isProcessing` is true
- Background changes to gray (#9ca3af) when disabled
- Cursor changes to "not-allowed" when disabled
- Opacity reduced to 0.6 when disabled
- Hover effects disabled when processing
- Early return in onClick if already processing (prevents double-clicks)

### 3. Canvas2 Component (`src/components/Canvas2.tsx`)

**Auto-Focus Already Implemented:**
- The `new-item` SSE event handler already includes auto-focus functionality
- When a new item is created, it automatically:
  - Centers the view on the new item
  - Applies appropriate zoom level (0.8 for most items, 1.0 for doctor notes)
  - Smooth animation with 1200ms duration
  - 800ms delay to ensure node is rendered

**No Page Refresh on Board Reset:**
- Updated `board-reloaded` SSE event handler
- Now fetches fresh data and updates state instead of `window.location.reload()`
- Smooth update without page refresh

### 4. Server Configuration (`api/server-redis.js`)

**Patient Report Zone Configuration:**
- Patient Report endpoint already configured to use `patient-report-zone` by default
- Zone configuration includes:
  - `patient-report-zone`: { x: -625, y: 10700, width: 2750, height: 2800 }
- If no zone specified, defaults to patient-report-zone
- If zone specified in request, uses that zone
- If x/y coordinates provided, uses those coordinates

## User Experience Flow

### DILI Diagnostic Generation:
1. User clicks "Generate DILI Diagnosis" button
2. Button becomes disabled (gray, not-allowed cursor)
3. Loading modal appears: "Processing - Generating DILI Diagnosis... Please wait."
4. API call to `/api/dili-diagnostic` with zone: 'dili-analysis-zone'
5. Server creates item and broadcasts via SSE
6. Loading modal closes automatically
7. Canvas auto-focuses on new diagnostic item in DILI Analysis Zone
8. Button re-enables

### Patient Report Generation:
1. User clicks "Generate Patient Report" button
2. Button becomes disabled (gray, not-allowed cursor)
3. Loading modal appears: "Processing - Generating Patient Report... Please wait."
4. API call to `/api/patient-report` with zone: 'patient-report-zone'
5. Server creates item and broadcasts via SSE
6. Loading modal closes automatically
7. Canvas auto-focuses on new report item in Patient Report Zone
8. Button re-enables

## Error Handling

- If API call fails, loading modal closes
- Error modal appears with message: "Failed to generate [diagnosis/report]. Please try again."
- Button re-enables for retry
- User can dismiss error modal

## Zone Placement Verification

✅ **DILI Diagnostic** → Renders in `dili-analysis-zone` (y: 7000-9800)
✅ **Patient Report** → Renders in `patient-report-zone` (y: 10700-13500)

Both items are correctly placed in their designated zones with proper auto-positioning to avoid overlaps.

## Technical Details

**API Endpoints:**
- DILI Diagnostic: `POST /api/dili-diagnostic`
- Patient Report: `POST /api/patient-report`

**SSE Events:**
- `new-item`: Broadcasts when new item created
- `board-reloaded`: Broadcasts when board is reset (no longer causes page refresh)

**Auto-Focus:**
- Zoom level: 0.8 (default), 1.0 (doctor notes)
- Animation duration: 1200ms
- Delay before focus: 800ms (ensures rendering)
- Centers on item's center point (x + width/2, y + height/2)
