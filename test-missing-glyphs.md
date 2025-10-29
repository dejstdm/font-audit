# Testing Missing Glyph Detection

## How to Test This Feature

### Option 1: Use a Limited Font
1. **Upload a font that only supports basic Latin** (A-Z, a-z, 0-9)
2. **Select languages with extended characters** (like Serbian Cyrillic, Arabic, Hebrew)
3. **Go to Coverage Grid** - you should see missing glyphs highlighted in red

### Option 2: Create a Test Font
You can create a simple test font that's missing specific characters:
- Use a font editor to remove certain glyphs
- Or use a font that only covers ASCII range

### Option 3: Test with System Fonts
Some system fonts have limited character sets:
- **Windows**: Some system fonts may not have Cyrillic or Arabic
- **macOS**: Some fonts may lack certain Unicode blocks

## What You Should See

### ✅ Working Detection:
- Characters with missing glyphs show **red border and background**
- Tooltip shows: `Character (U+XXXX) - Missing in FontName (confidence: XX%)`
- "Show Missing Only" button filters to show only problematic characters

### ❌ No Detection Issues:
- All characters show normally (no red highlighting)
- Tooltip shows: `Character (U+XXXX) - Present in FontName (confidence: XX%)`

## Test Scenarios

### Scenario 1: Basic Latin Font + Extended Language
1. Upload a font that only has A-Z, a-z, 0-9
2. Select Serbian Cyrillic (sr-Cyrl) or Arabic
3. Check Coverage Grid for red-highlighted missing characters

### Scenario 2: Monospace Font + Special Characters
1. Upload a monospace font (like Courier)
2. Select English language (has punctuation like em dash, quotes)
3. Look for missing punctuation marks

### Scenario 3: Font with Missing Numbers
1. Use a decorative font that might not have all numbers
2. Select any language with 0-9 coverage
3. Check if numbers are highlighted as missing

## Expected Behavior

- **Detection runs automatically** when fonts and languages are loaded
- **Loading state** shows "Detecting missing glyphs..." during detection
- **Results are cached** - re-detection is fast on page reload
- **Visual feedback** is immediate and clear
- **Confidence levels** help you understand detection accuracy

## Troubleshooting

If you don't see any missing glyphs:
1. **Check the font**: Your font might be very complete
2. **Try different languages**: Some languages have more unique characters
3. **Use a limited font**: Create or find a font with known limitations
4. **Check console**: Look for detection errors in browser dev tools

The detection system uses Canvas API to compare rendered text, so it should catch even subtle differences in glyph availability.
