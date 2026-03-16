# Real US Currency Images Setup

## 📸 Required Images

Place high-quality PNG images of real US currency in this folder:

### Dollar Bills (PNG format, 300 DPI recommended)
- `dollar_1.png` - Front of $1 bill (Washington)
- `dollar_5.png` - Front of $5 bill (Lincoln)
- `dollar_10.png` - Front of $10 bill (Hamilton)
- `dollar_20.png` - Front of $20 bill (Jackson)

**Recommended dimensions:** 600x250 pixels

### Coins (PNG format, transparent background, 300 DPI)
- `coin_dollar.png` - Sacagawea/Presidential dollar
- `coin_quarter.png` - 25¢ quarter
- `coin_dime.png` - 10¢ dime
- `coin_nickel.png` - 5¢ nickel
- `coin_penny.png` - 1¢ penny

**Recommended dimensions:** 400x400 pixels (square, centered)

---

## 🔍 Where to Get Images

### Option 1: US Treasury / Federal Reserve (Public Domain)
- Visit: https://www.uscurrency.gov/
- Download official currency images
- These are public domain and free to use

### Option 2: Free Stock Photo Sites
- Unsplash.com (search "US currency")
- Pexels.com (search "dollar bill")
- Pixabay.com (search "US coins")

### Option 3: Take Your Own Photos
- Use a smartphone camera
- Good lighting (natural light works best)
- Flat surface with neutral background
- High resolution (at least 1920x1080)

---

## ⚖️ Legal Notice

**Educational Use Only:**
This software uses currency images for educational worksheets only. When obtaining or using currency images:

1. ✅ **Allowed:** Educational materials, worksheets, teaching aids
2. ✅ **Allowed:** Public domain images from US Treasury
3. ✅ **Allowed:** Stock photos with proper licensing
4. ❌ **Not Allowed:** Counterfeiting or fraudulent use
5. ❌ **Not Allowed:** Printing at actual currency size

**Important:**
- Images will be automatically resized for worksheet use
- Worksheets are clearly marked as educational materials
- Follow all local laws regarding currency reproduction

---

## 🛠️ Technical Specifications

### File Format
- **Format:** PNG (with transparency for coins)
- **Color:** RGB
- **Bit Depth:** 24-bit or 32-bit (with alpha)

### Image Quality
- **Resolution:** 300 DPI minimum
- **Size:** Under 500KB per image (compressed)
- **Background:** White for bills, transparent for coins

### Naming Convention (IMPORTANT)
```
Bills:
- dollar_1.png
- dollar_5.png
- dollar_10.png
- dollar_20.png

Coins:
- coin_dollar.png
- coin_quarter.png
- coin_dime.png
- coin_nickel.png
- coin_penny.png
```

---

## 🔧 Setup Instructions

### Step 1: Add Images
1. Place all PNG files in this folder: `/public/assets/currency/`
2. Ensure filenames match exactly (case-sensitive)
3. Verify file sizes are reasonable (<500KB each)

### Step 2: The System Will Auto-Load
The worksheet generator will automatically:
- Check for real images in this folder
- Load and embed them in PDFs
- Fall back to drawn versions if images missing

### Step 3: Test
Generate a Money & Currency worksheet to verify images appear correctly.

---

## 📦 Current Status

### Installed Images:
- [ ] dollar_1.png
- [ ] dollar_5.png
- [ ] dollar_10.png
- [ ] dollar_20.png
- [ ] coin_dollar.png
- [ ] coin_quarter.png
- [ ] coin_dime.png
- [ ] coin_nickel.png
- [ ] coin_penny.png

**Status:** Using drawn fallback versions until real images are added.

---

## 💡 Tips for Best Results

1. **Crop tightly** - Remove excess background
2. **High contrast** - Clear, crisp images work best
3. **Consistent lighting** - Avoid shadows and glare
4. **Front side only** - Use obverse (front) of currency
5. **Optimize file size** - Use PNG compression tools

---

## 🎓 Educational Use Statement

These currency images are used exclusively for creating educational worksheets to teach:
- Money counting and arithmetic
- Currency recognition
- Financial literacy
- Basic math skills

All worksheets are clearly labeled as educational materials and are not intended to represent actual currency.

---

**Need Help?** Contact your development team for assistance with image setup.
