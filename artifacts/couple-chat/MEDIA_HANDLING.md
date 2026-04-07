# Media Handling Architecture

## Overview
This app uses two distinct approaches for media storage to optimize database size and performance:

- **Images**: Stored as compressed Base64 strings
- **GIFs**: Stored as URLs from Giphy API

---

## Image Handling (Base64 Compression)

### Flow
1. User picks image from gallery via `ImagePicker`
2. Image is passed to `compressImage()` from `lib/imageCompression.ts`
3. Compression settings applied:
   - Max width: 800px
   - Max height: 800px
   - Quality: 0.7 (70%)
4. Compressed Base64 string is returned (~50-200KB)
5. Base64 is stored in message as `mediaBase64` with `mediaType: "image"`

### Storage Location
- **State**: `AppContext.messages[].mediaBase64`
- **Persistence**: AsyncStorage (local device storage)
- **Size limit per image**: 200KB (warning logged if exceeded)

### Code
```typescript
// In chat.tsx handlePickImage()
const compressed = await compressImage(
  imageUri,
  IMAGE_COMPRESSION_SETTINGS.maxWidth,
  IMAGE_COMPRESSION_SETTINGS.maxHeight,
  IMAGE_COMPRESSION_SETTINGS.quality
);

await sendMessage({
  type: "media",
  mediaBase64: compressed.base64,
  mediaType: "image",
});
```

---

## GIF Handling (URL Only)

### Flow
1. User opens GIF picker via `GifPicker` component
2. GIF picker queries Giphy API using `giphyApiKey`
3. User selects a GIF (returns `{ id, url, preview, title }`)
4. Only the **URL** is sent, NOT Base64
5. URL is stored in message as `gifUrl` with `type: "gif"`

### Storage Location
- **State**: `AppContext.messages[].gifUrl`
- **Persistence**: AsyncStorage (local device storage)
- **Data size**: Just the URL string (~50-100 bytes)

### Code
```typescript
// In chat.tsx handleGifSelect()
const handleGifSelect = async (gif) => {
  await sendMessage({
    type: "gif",
    gifUrl: gif.url, // Only the URL!
  });
};
```

### Important
- ⚠️ **DO NOT** store GIFs as Base64
- ⚠️ **DO NOT** send `mediaBase64` for GIFs
- Validation in `AppContext.sendMessage()` warns if this is violated

---

## Database Size Impact

### Example
Assuming 1000 messages:

**Old approach (all Base64)**:
- 500 images × 150KB = 75 MB
- 500 GIFs × 2MB = 1000 MB
- **Total: ~1.08 GB** ❌ Exceeds 1GB free limit

**New approach (images + GIF URLs)**:
- 500 images × 150KB = 75 MB
- 500 GIF URLs × 100 bytes = 0.05 MB
- **Total: ~75 MB** ✅ Well within limits

---

## Configuration

### Image Compression Settings
Located in `lib/imageCompression.ts`:

```typescript
export const IMAGE_COMPRESSION_SETTINGS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7, // 70% JPEG quality
  maxSizeKB: 200, // Warning threshold
} as const;
```

### Giphy API Key
- Set in Profile screen under "Giphy API ključ"
- Stored in `AppContext.giphyApiKey`
- Used by `GifPicker` component for search and trending

---

## Console Logging

When sending messages, check console for:

**Images**:
```
✅ Image compressed: 145KB
✅ Image stored as Base64: 145KB (compressed)
```

**GIFs**:
```
✅ GIF stored as URL: https://media.giphy.com/...
```

**Errors**:
```
⚠️ Image is 250KB, exceeds max 200KB. Consider re-compressing.
⚠️ GIF message should not contain mediaBase64, only gifUrl
```

---

## Display Logic

### In `MessageBubble.tsx`:
- **Images**: `message.type === "media"` → Display Base64 via `data:image/jpeg;base64,...`
- **GIFs**: `message.type === "gif"` → Display URL directly via `<Image source={{ uri: message.gifUrl }} />`

---

## Future Improvements

1. **Progressive image loading**: Load thumbnail first, full image on tap
2. **Giphy categories**: Pre-populate trending GIFs on open
3. **Image cache**: Implement caching for frequently accessed images
4. **Backup strategy**: Consider Firebase Storage for images on production (paid plan)
