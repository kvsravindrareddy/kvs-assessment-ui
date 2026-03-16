# 📸 Currency Images - Download Instructions

## Current Status

The system is **fully implemented** and ready to use real US currency photographs. However, automated downloading is blocked by website protections.

## ✅ System Ready

The worksheet generator will:
1. ✅ Check for images in this folder
2. ✅ Automatically embed them in PDFs
3. ✅ Fall back to beautiful drawn versions if missing
4. ✅ Works perfectly either way!

## 📥 Manual Download Instructions

### Option 1: US Treasury Website (Recommended)

1. Visit: https://www.uscurrency.gov/denominations
2. Navigate to each bill denomination ($1, $5, $10, $20)
3. Right-click on the front image → Save As
4. Save to this folder with names:
   - `dollar_1.png`
   - `dollar_5.png`
   - `dollar_10.png`
   - `dollar_20.png`

### Option 2: Wikimedia Commons (High Quality)

1. Visit: https://commons.wikimedia.org/
2. Search for:
   - "US one dollar bill obverse"
   - "US five dollar bill obverse"
   - "US ten dollar bill obverse"
   - "US twenty dollar bill obverse"
   - "US dollar coin"
   - "US quarter coin"
   - "US dime coin"
   - "US nickel coin"
   - "US penny coin"

3. Download high-resolution versions
4. Rename to exact filenames (see below)

### Option 3: Use Free Stock Photos

**Sites:**
- Unsplash.com
- Pexels.com
- Pixabay.com

**Search:** "us dollar bill", "american currency", "us coins"

## 📋 Required Files (Exact Names)

### Bills (PNG format, 600x250 pixels recommended)
- `dollar_1.png`
- `dollar_5.png`
- `dollar_10.png`
- `dollar_20.png`

### Coins (PNG format, 400x400 pixels recommended)
- `coin_dollar.png`
- `coin_quarter.png`
- `coin_dime.png`
- `coin_nickel.png`
- `coin_penny.png`

## 🛠️ Image Preparation

### Using macOS (Built-in)
```bash
# Convert JPG to PNG
sips -s format png input.jpg --out output.png

# Resize to correct dimensions
sips -z 250 600 dollar_1.png  # Bills
sips -z 400 400 coin_penny.png  # Coins
```

### Using Online Tools
- **Resize:** https://www.iloveimg.com/resize-image
- **Convert:** https://cloudconvert.com/jpg-to-png
- **Compress:** https://tinypng.com/

### Using GIMP (Free)
1. Open image in GIMP
2. Image → Scale Image → Set dimensions
3. File → Export As → Select PNG
4. Rename to match required name

## ⚖️ Legal Notice

**Educational Use Only** ✅

This software uses currency images for educational worksheets to teach:
- Money counting and arithmetic
- Currency recognition
- Financial literacy
- Basic math skills

**Allowed:**
- Educational materials
- Teaching aids
- Math worksheets
- Public domain images

**Not Allowed:**
- Counterfeiting
- Printing at actual size
- Fraudulent use

**Reference:** 18 U.S.C. § 504 permits reproduction of currency images for educational purposes when clearly labeled as teaching materials.

## 🎯 Quick Start

**Easiest Method:**
1. Visit uscurrency.gov
2. Download 4 bill images
3. Visit Wikimedia Commons
4. Download 5 coin images
5. Resize all to specifications
6. Rename to exact filenames
7. Place in this folder
8. Done! ✅

## 🔧 Testing

After adding images:
```bash
# Start the app
npm start

# Generate a Money & Currency worksheet
# Check console: Should see "Currency images loaded: 9 images"
# Open PDF: Should show real currency photos!
```

## 💡 Alternative: Use Current System

**The drawn versions are already professional quality!**

If obtaining real images is difficult, the system's fallback drawn currency looks great:
- ✅ Realistic proportions
- ✅ Correct colors
- ✅ Proper denominations
- ✅ Educational clarity
- ✅ Ready to use now

The worksheet system works perfectly with or without real photos.

---

**Need Help?**
- See full guide: `/REAL_CURRENCY_SETUP.md`
- Check README: `/public/assets/currency/README.md`

**Status:** System ready, waiting for images (optional enhancement)
