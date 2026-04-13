# 🚀 GeoValuator - Startup & Usage Guide

## ✅ All Services Running Successfully!

### 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Main Dashboard** | http://localhost:5173/land-intelligence | Primary interface with all features |
| **API Test Page** | http://localhost:5173/test-api.html | Test all backend APIs |
| **Login** | http://localhost:5173/login | User authentication |
| **Register** | http://localhost:5173/register | New user registration |

---

## 🎯 How to Use the Three Main Features

### **Start Here:** http://localhost:5173/land-intelligence

This is your main dashboard with all three features integrated!

---

## 1️⃣ Search Location Feature

### How to Access:
1. Open http://localhost:5173/land-intelligence
2. Look at the **left sidebar**
3. Click **"Search Records"** button

### What You'll See:
- Search panel opens on the right side
- Type any location name (e.g., "Guntur", "Hyderabad")
- Autocomplete suggestions appear
- Click a result to navigate map
- Property details display

### Example Searches:
- `Guntur` - Will show properties in Guntur
- `Amaravati` - Capital region properties
- `Hyderabad` - Properties in Hyderabad
- `GNT-101` - Search by survey number

---

## 2️⃣ My Properties Feature

### How to Access:
1. Open http://localhost:5173/land-intelligence
2. Look at the **left sidebar**
3. Click **"My Properties"** button

### What You'll See:
- Your land registry panel opens
- List of registered properties
- **"+ Register Property"** button

### To Add a Property:
1. Click "+ Register Property"
2. Fill in the form:
   - Survey Number (e.g., "SRV-123")
   - Area in sq. yards
   - Purchase Price
   - Address
3. Optional: Upload documents
4. Click "Register Property"

### Note:
- Requires **login** (JWT authentication)
- If not logged in, you'll see authentication error
- Register at http://localhost:5173/register first

---

## 3️⃣ AI Assistant Feature

### How to Access:
1. Open http://localhost:5173/land-intelligence
2. Look at the **left sidebar**
3. Click **"AI Assistant"** button

### What You'll See:
- Chat panel opens on the right side
- Message input box at bottom
- AI responses appear in chat

### Example Questions:
- "What is the average land price in Guntur?"
- "How do I check legal risks for a property?"
- "Analyze property in Amaravati"
- "What are the price trends for commercial land?"
- "Help me with legal documentation"

### AI Capabilities:
- 💬 Natural language chat
- 💰 Price estimation
- ⚖️ Legal risk analysis
- 📈 Market forecasting
- 🎯 Usage recommendations

---

## 🔐 Authentication Quick Start

### First Time Setup:
1. Go to http://localhost:5173/register
2. Enter your email
3. Choose location (e.g., "Guntur")
4. Receive OTP via email
5. Verify OTP
6. You're logged in!

### Subsequent Logins:
1. Go to http://localhost:5173/login
2. Enter email and password
3. Click Login

---

## 🧪 Test All Features

### Quick API Test:
Visit http://localhost:5173/test-api.html and click:
- 🔍 **Test Location Search** - Verify geocoding works
- 🏘️ **Test Land/Property Search** - Verify property search
- 📋 **Test My Properties** - Check authentication
- 🤖 **Test AI Chat** - Verify AI responses
- 💰 **Test Price Estimate** - Check price estimation
- ⚖️ **Test Legal Risk Analysis** - Verify legal analysis

All buttons should show ✅ SUCCESS or ✅ PASS

---

## 🎬 Step-by-Step Demo

### Demo 1: Search for Properties
```
1. Open: http://localhost:5173/land-intelligence
2. Click: "Search Records" (left sidebar)
3. Type: "guntur"
4. Result: See properties and locations
5. Click: Any result to view on map
```

### Demo 2: Register a Property
```
1. Open: http://localhost:5173/land-intelligence
2. Click: "My Properties" (left sidebar)
3. If not logged in, click "Login" and sign in
4. Click: "+ Register Property"
5. Fill: Survey number, area, price, address
6. Click: "Register Property"
7. Result: Property added to your registry
```

### Demo 3: Chat with AI
```
1. Open: http://localhost:5173/land-intelligence
2. Click: "AI Assistant" (left sidebar)
3. Type: "What is the price trend in Amaravati?"
4. Press: Enter or click Send
5. Result: AI provides market analysis
6. Ask: Follow-up questions
```

---

## 🐛 Troubleshooting

### If page shows blank:
1. Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. Clear browser cache
3. Check browser console (F12) for errors
4. Verify all services are running (see below)

### Verify Services:
```powershell
# Check if ports are active
netstat -ano | findstr "5050 5173 8000"
```

Should show:
- `5050` - Backend running ✅
- `5173` - Frontend running ✅
- `8000` - AI Engine running ✅

### If features don't respond:
1. Check backend terminal for errors
2. Verify API at http://localhost:5050/api/health
3. Run test page: http://localhost:5173/test-api.html
4. Check Network tab in browser (F12)

---

## 📊 Current Status

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Frontend | ✅ Running | 5173 | http://localhost:5173 |
| Backend | ✅ Running | 5050 | http://localhost:5050 |
| AI Engine | ✅ Running | 8000 | http://localhost:8000 |
| Database | ✅ In-Memory | N/A | Using demo data |

---

## 🎯 Main Entry Point

**Start here for all features:**
# http://localhost:5173/land-intelligence

This single page contains:
- ✅ Search Location (Search Records button)
- ✅ My Properties (My Properties button)
- ✅ AI Assistant (AI Assistant button)

All three features work and are integrated!

---

## 💡 Tips

1. **Use the sidebar navigation** - All features are accessible from left sidebar buttons
2. **Login first** - Some features like "My Properties" require authentication
3. **Test API page** - Use http://localhost:5173/test-api.html to verify backend
4. **Demo data available** - System has sample properties preloaded for testing
5. **AI works without API key** - Has demo/fallback mode if Gemini API fails

---

## ✅ All Features Verified & Working!

The three main features are fully operational:
- 🔍 **Search Location** - Working
- 📋 **My Properties** - Working (requires login)
- 🤖 **AI Assistant** - Working

**Your GeoValuator application is ready to use!** 🎉
