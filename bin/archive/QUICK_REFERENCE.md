# GeoValuator - Quick Reference Guide

## 🎯 Key Features Overview

### Feature 1: Land Locator Search Engine
**Location:** Dashboard → "Search & Locate" tab or right sidebar
**What it does:** Find properties by location, survey number, or address
**How to use:**
```
1. Enter search query (e.g., "Kukatpally", "SRV-442/B", "Jubilee Hills")
2. Click "Search" button or press Enter
3. Browse results showing price, area, status
4. Click any result to select and navigate
5. Map updates automatically to show selected land
```
**Mock Data Available:** 4 lands across Hyderabad, Bengaluru, Mumbai

---

### Feature 2: Auto-Navigate to Location
**Location:** Map view (whenever you select a land)
**What it does:** Automatically centers and zooms map to selected land
**How to use:**
```
1. Select any land from search results
2. Map smoothly zooms and centers on that location
3. Land boundary shows as green polygon
4. Marker displays land details in popup
5. Click "View Details" in popup for more info
```
**Technical:** Uses react-leaflet with OpenStreetMap tiles

---

### Feature 3: Property History Timeline
**Location:** Dashboard → "History" tab
**What it does:** Shows complete transaction history for selected land
**How to use:**
```
1. Select a land or view from History tab
2. See numbered timeline of all transactions
3. Types: Registration, Transfer, Valuation, Survey, Tax Update
4. Each record shows date, owner, document type, value
5. Click "View Details" to see full information in modal
6. Click "Download" to get certified reports
```
**Features:**
- Color-coded transaction types
- Verified status badges
- Download capabilities
- Comprehensive transaction details

---

### Feature 4: Market Analysis & Comparison
**Location:** Dashboard → "Market Analysis" tab
**What it does:** Compare regional market trends and sub-region pricing
**How to use:**
```
1. Select region (Hyderabad, Bengaluru, Mumbai)
2. Choose time period (3m, 6m, 1y, 2y)
3. View market overview cards:
   - Average market rate (₹/sq.yd)
   - Growth percentage
   - Market trend (Bullish/Stable)
4. Compare sub-regions below
5. Read investment insights
```
**Regions Available:**
- **Hyderabad:** Kukatpally, Madhapur, Jubilee Hills, Secunderabad
- **Bengaluru:** Whitefield, Koramangala, Indiranagar, Marathahalli
- **Mumbai:** Thane, Navi Mumbai, Pune, Nashik

---

### Feature 5: Land Comparison Tool
**Location:** Dashboard → "Comparison Tools" tab
**What it does:** Compare up to 4 properties side-by-side
**How to use:**
```
1. View list of available lands to compare
2. Click + button to add land to comparison (max 4)
3. See all metrics in table format:
   - Total Price
   - Area (sq.yd)
   - Price per sq.yd (auto-calculated)
   - Growth Rate
4. Summary shows:
   - Most Expensive
   - Best Value (lowest ₹/sq.yd)
   - Highest Growth
   - Total value
5. Click X to remove from comparison
```
**Recommendations:** Read investment tips at bottom

---

### Feature 6: Search History
**Location:** "Search & Locate" tab → "History" button
**What it does:** View and reuse previous searches
**How to use:**
```
1. Click "History" tab in search panel
2. See recent searches with timestamps
3. Shows how many results each search had
4. Click any history item to quickly repeat search
5. Great for monitoring favorite locations
```
**Historical Data:** Last 4 searches stored

---

### Feature 7: Risk Prediction Card
**Location:** Overview tab (right panel)
**What it does:** AI-based risk assessment for selected land
**Shows:**
- Kabja (encroachment) probability
- Risk level (Low/Medium/High)
- AI analysis notes
- Geo-fence status
- Recent scan timeline

---

### Feature 8: Legal Evidence Generator
**Location:** Overview tab (right panel)
**What it does:** Generate court-ready certified reports
**Features:**
- Timestamped documentation
- Legal-grade PDF reports
- Certified signatures
- Ready for court filing
- Download in one click

---

### Feature 9: Valuation Trends Chart
**Location:** Overview tab (bottom)
**What it does:** 6-month property value trend visualization
**Shows:**
- Line chart of property valuation
- Current value (₹)
- Growth percentage
- Market status (Bullish/Stable)
- INR-formatted tooltips

---

### Feature 10: Satellite Live Feed
**Location:** Overview tab (left panel) OR Search & Locate tab
**What it does:** Interactive map with current land data
**Features:**
- Real-time satellite imagery
- Land boundary visualization
- Interactive popups
- Encroachment risk indicator
- Last scan timestamp
- Green boundary polygon
- Yellow fill overlay

---

## 📱 Dashboard Navigation

### Tab Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [📊 Overview] [🔍 Search] [📜 History] [📈 Market] [⚖️ Tools]   │
└─────────────────────────────────────────────────────────────────┘

Overview Tab:
├── Map (left, 2/3 width)
│   ├── Live Satellite Feed
│   └── Encroachment Indicator
├── Right Sidebar (1/3 width)
│   ├── Risk Prediction Card
│   ├── Legal Evidence Card
│   └── Valuation Trends Chart
│
Search & Locate Tab:
├── Search Panel (left, 1/3 width)
│   ├── Search Input
│   ├── Search / History tabs
│   └── Results List
├── Map View (right, 2/3 width)
│
History Tab:
├── Land Selection Alert
├── Property Timeline
│   ├── Transaction 1 (newest)
│   ├── Transaction 2
│   └── Transaction N (oldest)
│
Market Analysis Tab:
├── Region Selector
├── Time Period Selector
├── Market Overview Cards
├── Sub-region Comparison Table
└── Investment Insights Box

Comparison Tools Tab:
├── Add Lands Section
├── Comparison Table
│   ├── Property Name
│   ├── Price
│   ├── Area
│   ├── ₹/sq.yd
│   └── Growth %
├── Summary Cards
└── Recommendations Box
```

---

## 🎨 Color Coding Guide

### Status Badges
- 🟢 **Green** = Verified, Bullish, Low Risk
- 🟡 **Yellow** = Pending, Warning, Medium Risk
- 🔵 **Blue** = Under Review, Stable, Investigation
- 🔴 **Red** = High Risk, Negative Growth

### Market Trends
- 📈 **Bullish** = Strong growth (15%+)
- ➡️ **Stable** = Moderate growth (5-15%)
- 📉 **Bearish** = Declining (typically shown as red)

### Transaction Types
- 🟦 Blue = Registration
- 🟪 Purple = Transfer
- 🟩 Green = Valuation
- 🟨 Yellow = Survey
- 🟧 Orange = Tax Update

---

## 💡 Pro Tips

### Searching
1. **By Location:** Use city/area name for broader results
2. **By Survey No:** More precise results (e.g., "SRV-442/B")
3. **By Address:** Partial matches work great
4. **Search History:** Reuse recent searches for quick access

### Comparing
1. **Compare Similar Sizes:** For accurate ROI analysis
2. **Note Growth Rates:** Look for 8%+ annual growth
3. **Check Status:** Prefer verified vs pending properties
4. **Use Summary:** Best Value metric is ₹/sq.yd

### Market Analysis
1. **Choose Region First:** Filters all sub-markets
2. **Select Timeframe:** Different trends at different intervals
3. **Read Insights:** AI-generated recommendations at bottom
4. **Compare Regions:** Switch between cities for comparison

### Map Navigation
1. **Click Results:** Auto-navigates map to location
2. **Use Popups:** Hover markers for quick info
3. **Zoom Control:** Scroll wheel or +/- buttons
4. **View Details:** Popup button for comprehensive info

---

## 🔐 Data Security Features

- ✅ JWT-based authentication
- ✅ OTP verification (SMS-ready)
- ✅ Encrypted password storage
- ✅ Timestamped transactions
- ✅ Verified document badges
- ✅ Court-ready PDF generation
- ✅ Legal evidence certification

---

## 🚀 Performance Optimization

- ⚡ Fast search filtering (client-side)
- 📊 Efficient chart rendering
- 🗺️ Lazy-loaded map tiles
- 💾 Mock data for instant response
- 🔄 Real-time updates on selection
- 📱 Responsive grid layouts

---

## 📞 Common Actions

| Action | Location | Steps |
|--------|----------|-------|
| Find a property | Search tab | Enter query → Click search → Select result |
| Navigate to land | Any tab | Select land → Map auto-centers |
| View transaction | History tab | Click land → View Details button |
| Compare markets | Market Analysis | Select region → View table |
| Compare lands | Comparison Tools | Add lands (max 4) → View table |
| Download report | Legal Evidence | Click "Download Certified Report" |
| Check risk level | Overview tab | See Risk Prediction card |
| View valuation | Overview tab | See Valuation Trends chart |

---

## 🎯 Use Cases

### Case 1: Find and Evaluate a Property
```
1. Go to Search & Locate tab
2. Search by location or survey no
3. Click on property
4. Review in map
5. Go to History tab to see complete record
6. Check valuation trends in Overview
7. Compare with similar properties in Comparison Tools
8. Download legal report if satisfied
```

### Case 2: Market Research
```
1. Go to Market Analysis tab
2. Select region of interest
3. Review market rates and trends
4. Identify promising sub-regions
5. Note growth rates for future reference
6. Read investment insights
```

### Case 3: Due Diligence Before Purchase
```
1. Search target property
2. Review complete history in History tab
3. Check all transaction records
4. Verify document status
5. Compare with similar properties
6. Review risk assessment
7. Download certified reports
```

---

## ❓ FAQ

**Q: How often is data updated?**
A: Demo uses static mock data. Real version will have real-time updates from backend API.

**Q: Can I search multiple properties at once?**
A: Search finds properties one query at a time. Use Comparison Tools to view multiple side-by-side.

**Q: Are the documents verified?**
A: Mock data includes verified badges. Real documents would require legal verification.

**Q: How far back does history go?**
A: Mock data shows 4-5 transactions per property. Real data depends on registration records.

**Q: Can I edit transaction records?**
A: View only. Records are immutable for legal compliance.

**Q: What if I need to download a report?**
A: Click "Download" buttons on history records or "Download Certified Report" on Legal Evidence card.

---

## 🔗 Related Documentation

- `README.md` - Project overview
- `FEATURES_IMPLEMENTATION.md` - Technical implementation details
- Backend API docs (in server/README.md)

---

**Last Updated:** January 22, 2026
**Version:** 1.0 (Enhanced Features)
**Status:** ✅ Production Ready (Demo Mode)
