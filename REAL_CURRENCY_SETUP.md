# 📸 Real US Currency Images - Setup Guide

## ✅ Implementation Complete

The worksheet system now supports **real photograph-quality US currency images**!

---

## 🎯 How It Works

### System Architecture:
1. **Automatic Loading** - Currency images load from `/public/assets/currency/`
2. **Smart Fallback** - If real images missing, uses professional drawn versions
3. **No Breaking Changes** - Works immediately with or without images

### When You Generate a Money Worksheet:
```javascript
1. System checks: /public/assets/currency/dollar_5.png
2. If found → Embeds real photo in PDF
3. If missing → Uses drawn version (still looks great!)
```

---

## 📁 Required File Structure

```
kvs-assessment-ui/
└── public/
    └── assets/
        └── currency/
            ├── README.md (instructions - already created ✓)
            ├── dollar_1.png  ← Add real $1 bill photo
            ├── dollar_5.png  ← Add real $5 bill photo
            ├── dollar_10.png ← Add real $10 bill photo
            ├── dollar_20.png ← Add real $20 bill photo
            ├── coin_dollar.png ← Add real $1 coin photo
            ├── coin_quarter.png ← Add real 25¢ photo
            ├── coin_dime.png ← Add real 10¢ photo
            ├── coin_nickel.png ← Add real 5¢ photo
            └── coin_penny.png ← Add real 1¢ photo
```

---

## 🖼️ Image Specifications

### Dollar Bills
- **Format:** PNG
- **Size:** 600 x 250 pixels (2.4:1 ratio)
- **DPI:** 300
- **Background:** White or transparent
- **View:** Front side (obverse) only
- **File size:** < 300KB each

### Coins
- **Format:** PNG with transparency
- **Size:** 400 x 400 pixels (square)
- **DPI:** 300
- **Background:** Transparent
- **View:** Heads side (obverse) only
- **File size:** < 200KB each

---

## 🔍 Where to Get Images

### Option 1: US Bureau of Engraving (FREE & LEGAL) ✅
- **Website:** https://www.uscurrency.gov/denominations
- **License:** Public domain
- **Quality:** Official government images
- **Download:** Right-click → Save image

### Option 2: Wikimedia Commons (FREE) ✅
- **Website:** https://commons.wikimedia.org/
- **Search:** "US dollar bill" or "US coin"
- **License:** Public domain (check each image)
- **Quality:** High-resolution photos

### Option 3: Take Your Own Photos ✅
**Camera Setup:**
- Modern smartphone (iPhone 12+ or Android equivalent)
- Natural daylight (near window)
- Flat white surface
- No shadows or glare

**Photography Steps:**
1. Place currency flat on white paper
2. Position camera directly above (parallel)
3. Ensure good lighting (no flash)
4. Take photo at highest resolution
5. Crop to remove background
6. Save as PNG

### Option 4: Stock Photo Sites (Check License)
- Unsplash.com
- Pexels.com
- Pixabay.com

**Search terms:** "us dollar", "american currency", "quarter coin"

---

## ⚙️ Setup Instructions

### Step 1: Obtain Images
Choose one of the methods above to get 9 currency images.

### Step 2: Prepare Images
Use free tools like:
- **GIMP** (https://www.gimp.org/) - Free Photoshop alternative
- **Paint.NET** (https://www.getpaint.net/) - Windows
- **Preview** (Mac built-in) - Resize and crop
- **Online:** https://www.iloveimg.com/resize-image

**Resize to specifications:**
- Bills: 600x250px
- Coins: 400x400px

**Optimize file size:**
- Use PNG compression
- Remove metadata
- Target < 300KB per file

### Step 3: Rename Files
**CRITICAL:** Filenames must match exactly (case-sensitive):
```
dollar_1.png
dollar_5.png
dollar_10.png
dollar_20.png
coin_dollar.png
coin_quarter.png
coin_dime.png
coin_nickel.png
coin_penny.png
```

### Step 4: Upload Files
Place all 9 PNG files in: `/public/assets/currency/`

### Step 5: Test
1. Start development server: `npm start`
2. Navigate to Worksheets → Money & Currency
3. Generate a worksheet
4. Check console: Should see "Currency images loaded: 9 images"
5. Open PDF: Should show real currency photos!

---

## 🧪 Verification Checklist

Before going live, verify:

- [ ] All 9 files present in `/public/assets/currency/`
- [ ] Filenames match exactly (lowercase, underscore)
- [ ] Files are PNG format (not JPG or JPEG)
- [ ] Bill images are approximately 600x250px
- [ ] Coin images are approximately 400x400px
- [ ] File sizes under 500KB each
- [ ] Console shows "Currency images loaded: 9 images"
- [ ] Generated PDF shows real photos (not drawn versions)
- [ ] Images print clearly (not pixelated)

---

## 🔧 Troubleshooting

### Images Not Loading
**Console says: "Currency images not available"**

**Fixes:**
1. Check folder path: `/public/assets/currency/` (not `/src/assets/`)
2. Verify filenames exactly match (case-sensitive)
3. Ensure files are PNG (not jpg, jpeg)
4. Clear browser cache
5. Restart development server

### Images Look Bad in PDF
**Problem:** Blurry or pixelated

**Fixes:**
1. Use higher resolution images (300 DPI minimum)
2. Ensure PNG format (not compressed JPG)
3. Check original image quality
4. Re-export at higher quality settings

### File Size Too Large
**Problem:** Page loads slowly

**Fixes:**
1. Use PNG compression tools
2. Reduce dimensions slightly (bills: 500x208, coins: 350x350)
3. Remove alpha channel if not needed
4. Use online optimizers: tinypng.com

---

## ⚖️ Legal & Educational Use

### ✅ ALLOWED (Our Use Case)
- Educational worksheets
- Teaching materials
- Math practice sheets
- Non-commercial educational apps
- Images clearly marked as teaching aids

### ❌ NOT ALLOWED
- Counterfeiting attempts
- Printing at actual currency size
- Fraudulent representations
- Commercial products without license

### Our Implementation:
✅ Worksheets clearly labeled "Student Worksheet"
✅ Images used at reduced scale
✅ Educational purpose only
✅ Not printed at actual currency dimensions

**Reference:** 18 U.S.C. § 504 allows reproduction of currency for educational purposes.

---

## 📊 Current Status

**System Status:** ✅ READY
**Fallback Mode:** ✅ ACTIVE (drawn versions work)
**Real Images:** ⏳ PENDING (waiting for 9 PNG files)

**Once you add images:**
- System automatically detects them
- No code changes needed
- Instantly embedded in PDFs
- Professional worksheet quality

---

## 💡 Pro Tips

1. **Consistent Lighting** - All photos should have similar brightness
2. **Crop Tightly** - Remove excess background for cleaner look
3. **Test Print** - Generate sample worksheet and print to verify quality
4. **Backup Images** - Keep high-res originals in case you need to re-export
5. **Update Annually** - US currency designs change; update images periodically

---

## 🎓 Educational Value

With real currency images, students learn:
- **Visual Recognition** - Identify actual bills and coins
- **Security Features** - See real currency details
- **Real-World Connection** - Practice with familiar images
- **Financial Literacy** - Build confidence with money

---

## 📞 Need Help?

If you encounter issues:
1. Check console for error messages
2. Verify all files are in correct location
3. Test with a single image first
4. See troubleshooting section above

**Everything is set up and ready - just add the 9 PNG files and you're done!** 🚀

---

## Quick Start Summary

```bash
# 1. Get images (choose one method):
#    - Download from uscurrency.gov
#    - Take photos with smartphone
#    - Download from Wikimedia Commons

# 2. Resize images:
#    Bills: 600x250px
#    Coins: 400x400px

# 3. Rename exactly:
dollar_1.png, dollar_5.png, dollar_10.png, dollar_20.png
coin_dollar.png, coin_quarter.png, coin_dime.png, coin_nickel.png, coin_penny.png

# 4. Place in folder:
/public/assets/currency/

# 5. Test:
npm start
# Navigate to Worksheets → Money & Currency → Generate

# ✅ Done!
```

---

**Status:** Implementation complete, ready for real currency photos! 📸💵
