# GeoValuator - Complete Architecture Implementation Guide

## 🎯 Project Overview

This document covers the complete implementation of your GeoValuator application with:
- **OTP-based Authentication** (Email + SMS)
- **AI-Powered Risk Analysis** (Kabja Detection)
- **Price Prediction Engine**
- **Satellite Encroachment Detection**
- **Smart Map Search** with Geocoding
- **Security Alerts** on new device logins

---

## 📁 Project Structure

```
GEOVALUVATOR/
├── ai_engine/                 # Python FastAPI Backend
│   ├── main.py               # 3 AI endpoints
│   └── requirements.txt       # Python dependencies
│
├── server/                    # Node.js Express Backend
│   ├── controllers/
│   │   └── authController.js  # OTP + Login Security
│   ├── models/
│   │   ├── User.js           # Enhanced with device tracking
│   │   └── Land.js
│   ├── routes/
│   │   ├── auth.js           # Updated with OTP routes
│   │   ├── api.js
│   │   ├── land.js
│   │   └── market.js
│   ├── index.js
│   └── package.json           # Updated with new dependencies
│
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SmartMapSearch.jsx       # NEW: Geocoding + Map
│   │   │   ├── SmartMapSearch.css
│   │   │   ├── AIAgentChat.jsx          # NEW: AI Chat Interface
│   │   │   ├── AIAgentChat.css
│   │   │   └── [other components]
│   │   └── main.jsx
│   └── package.json
│
├── .env                       # Configuration (NEW)
├── .env.example              # Example config
└── INTEGRATION_SETUP.md       # This file
```

---

## 🔐 Feature 1: OTP Authentication & Security

### Architecture
```
User Registration Flow:
1. User enters email → System sends OTP
2. User verifies OTP → Creates password
3. Registration complete with secure hash

Login Flow:
1. User enters email + password
2. System checks device/IP against stored values
3. If NEW device detected → Security alert email sent
4. JWT token issued for session management
```

### Implementation Details

#### A. Backend Setup (Node.js)

**1. Install Dependencies**
```bash
cd server
npm install nodemailer twilio request-ip useragent
```

**2. Environment Variables** (already in `.env`)
```env
# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# JWT
JWT_SECRET=your_secret_key
```

**3. User Model** (Updated in `server/models/User.js`)
```javascript
// New fields added:
- lastIp: IP address of last login
- lastDevice: Device/Browser info
- loginHistory: Array of login records
- twoFactorEnabled: Boolean flag
- twoFactorMethod: 'email' or 'phone'
```

#### B. API Endpoints

**Send OTP**
```http
POST /auth/send-otp
Content-Type: application/json

{
  "contact": "user@example.com",
  "type": "email"  // or "phone"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully to email",
  "expiresIn": "5 minutes"
}
```

**Verify OTP**
```http
POST /auth/verify-otp
{
  "contact": "user@example.com",
  "otp": "123456"
}
```

**Register with OTP**
```http
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "secure_password",
  "otp": "123456"
}
```

**Login (with Auto Security Alert)**
```http
POST /auth/login
{
  "email": "john@example.com",
  "password": "secure_password"
}

Response includes:
- JWT token
- Security alert message (if new device)
- User profile info
```

#### C. Email Configuration

**Using Gmail:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Set in `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

**Using AWS SES:**
```env
EMAIL_SERVICE=aws-ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

#### D. SMS Configuration (Twilio)

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from dashboard
3. Get a phone number (e.g., +12025551234)
4. Set in `.env`:
   ```
   TWILIO_SID=AC1234567890abcdef
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+12025551234
   ```

---

## 🗺️ Feature 2: Smart Map Search with Geocoding

### Architecture
```
User Input → Nominatim/Google Geocoding API → Coordinates
                                                    ↓
                                            Leaflet Map Centers
                                                    ↓
                                            FastAPI gets price data
                                                    ↓
                                            Display on Map Card
```

### Implementation Details

#### A. Frontend Component (React)

**File:** `client/src/components/SmartMapSearch.jsx`

**Features:**
- 🔍 **Autocomplete Search** - Real-time location suggestions
- 📍 **Interactive Map** - Zoom to search location
- 💰 **Price Data** - Fetches from Python AI engine
- 🎯 **Geolocation** - Display lat/lon coordinates

**Usage:**
```jsx
import SmartMapSearch from './components/SmartMapSearch';

export default function App() {
  return <SmartMapSearch />;
}
```

#### B. Geocoding Service

**Free Option (Nominatim/OpenStreetMap):**
- No API key required
- Rate limited to 1 request/second
- Good for development/small scale

**Paid Option (Google Maps):**
```env
GOOGLE_MAPS_API_KEY=AIzaSyD...
```
- Reliable and fast
- Higher rate limits
- ~$0.005 per request

#### C. Map Features

1. **Search Bar** with autocomplete
2. **Suggestions Dropdown** - Click to select
3. **Marker on Map** - Shows selected location
4. **Details Card** - Coordinates, price, sentiment
5. **Error Handling** - User-friendly messages

---

## 🤖 Feature 3: AI Agent Chat Interface

### Architecture
```
User Question (Chat)
        ↓
Parse Intent (Risk/Price/Encroachment)
        ↓
Extract Parameters (Location, Size, etc.)
        ↓
Call FastAPI Endpoint
        ↓
Format Response as Markdown
        ↓
Display in Chat UI
```

### Implementation Details

#### A. Chat Component

**File:** `client/src/components/AIAgentChat.jsx`

**Features:**
- 💬 **Chat Interface** - Conversational AI
- 🎯 **Intent Recognition** - Understands queries
- 📊 **Rich Responses** - Formatted data display
- ⌨️ **Keyboard Shortcuts** - Enter to send, Shift+Enter for newline
- 💡 **Quick Suggestions** - Pre-made queries

#### B. Supported Queries

**Risk Analysis:**
```
"What is the risk for my land in Jubilee Hills?"
"Analyze Kabja risk with 180 days absence"
"Risk assessment for property in Kukatpally with 2 disputes"
```

**Price Prediction:**
```
"Predict price for 200 sq yards in Kukatpally"
"What's the value of 500 sq yards in Gachibowli?"
"Price forecast for 150 sq yards in Hyderabad"
```

**Encroachment Detection:**
```
"Detect encroachment: [old_image_url] vs [new_image_url]"
"Compare satellite images for unauthorized construction"
```

#### C. Query Parsing Logic

```javascript
// Extracts from natural language:
- Location: "Jubilee Hills", "Kukatpally", etc.
- Size: "200 sq yards", "500 sqyd", etc.
- Days: "90 days", "6 months", etc.
- Disputes: "2 disputes", "1 legal case", etc.
- Images: URL pattern matching
```

---

## 🧠 Feature 4: Python FastAPI Backend (AI Engine)

### Setup

**1. Install Dependencies**
```bash
cd ai_engine
pip install -r requirements.txt
```

**2. requirements.txt:**
```
fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.5.0
opencv-python==4.8.0
numpy==1.24.0
python-multipart==0.0.6
httpx==0.25.0
```

**3. Run Server**
```bash
python main.py
# Server runs on http://127.0.0.1:8000
```

### API Endpoints

#### A. Risk Analysis
```http
POST /analyze-risk
Content-Type: application/json

{
  "owner_absence_days": 180,
  "has_boundary_wall": false,
  "nearby_disputes_count": 1,
  "location_tier": "Urban",
  "pixel_change_percentage": 15,
  "month": 6
}

Response:
{
  "risk_score": 85,
  "status": "🔴 High Risk",
  "risk_percentage": "85%",
  "risk_factors": [
    "🚨 HIGH: Owner absence >6 months",
    "🚧 HIGH: No boundary wall detected",
    "⚠️ 1 legal dispute(s) detected nearby",
    "🚧 CRITICAL: Unauthorized construction detected"
  ],
  "ai_suggestion": "Immediate Action Required: Visit land, document state...",
  "confidence": "High"
}
```

#### B. Price Prediction
```http
POST /predict-price
{
  "location": "Kukatpally",
  "sq_yards": 200
}

Response:
{
  "location": "Kukatpally",
  "property_size_sqyards": 200,
  "current_rate_per_sqyd": "₹45,000",
  "current_total_value": "₹9,000,000",
  "prediction_1_year": "₹10,260,000",
  "growth_rate_1year": "14%",
  "market_sentiment": "🔥 Bullish",
  "ai_message": "Based on infrastructure... we predict 14% appreciation"
}
```

#### C. Encroachment Detection
```http
POST /detect-encroachment
{
  "old_image_url": "https://example.com/old.jpg",
  "new_image_url": "https://example.com/new.jpg",
  "threshold": 0.15
}

Response:
{
  "encroachment_detected": true,
  "change_percentage": 18.5,
  "status": "🚨 ENCROACHMENT LIKELY",
  "ai_recommendation": "Immediate investigation required"
}
```

### Computer Vision Logic

**Image Comparison Algorithm:**
1. Download images from URLs
2. Convert to grayscale
3. Compute absolute difference
4. Apply threshold (30 intensity units)
5. Calculate % of changed pixels
6. Compare against threshold (15% default)

---

## 📱 Integration Flow

### Complete User Journey

**Step 1: Authentication**
```
User → Register/Login → OTP Verification → JWT Token
                      ↓
                New Device Alert (Email)
```

**Step 2: Map Search**
```
User → Search Location → Geocoding API → Map Centers
                                      ↓
                                AI predicts price → Display Card
```

**Step 3: AI Agent Chat**
```
User → Ask Question → Intent Recognition → Parse Parameters
                                        ↓
                                    Call FastAPI
                                        ↓
                                Format & Display Response
```

---

## 🚀 Setup Instructions

### 1. Backend (Node.js)

```bash
cd server
npm install
# Update .env with credentials
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend (React)

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. AI Engine (Python)

```bash
cd ai_engine
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### 4. Database (MongoDB)

```bash
# Install MongoDB locally or use MongoDB Atlas
# Update .env:
MONGODB_URI=mongodb://localhost:27017/geovaluator
```

### 5. Verify All Services

```bash
curl http://localhost:5000/       # Node backend
curl http://localhost:5173/       # React frontend
curl http://localhost:8000/       # FastAPI
# All should respond
```

---

## 🔧 Configuration Checklist

- [ ] MongoDB connection string in `.env`
- [ ] Email credentials (Gmail or AWS SES)
- [ ] Twilio account credentials
- [ ] JWT secret key set
- [ ] Node dependencies installed
- [ ] Python dependencies installed
- [ ] All servers running
- [ ] CORS properly configured

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  unique_citizen_id: String (UUID),
  nominee: { name, contact },
  land_records: [ObjectId],
  last_login: Date,
  lastIp: String,
  lastDevice: String,
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: Date
  }],
  twoFactorEnabled: Boolean,
  twoFactorMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### "OTP not received"
- Check email/SMS credentials in `.env`
- Verify Twilio account is active
- Check email spam folder

### "Map not loading"
- Verify Nominatim API is accessible
- Check browser console for errors
- Ensure Leaflet CSS is imported

### "AI Engine connection failed"
- Ensure Python server is running (`python main.py`)
- Check FastAPI is on port 8000
- Verify CORS is enabled

### "MongoDB connection error"
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure database exists

---

## 📈 Performance Optimization

1. **Image Optimization** - Compress satellite images before upload
2. **API Caching** - Cache geocoding results
3. **Database Indexing** - Index frequently queried fields
4. **Lazy Loading** - Load map tiles on demand
5. **Pagination** - Limit search results

---

## 🔒 Security Best Practices

1. **HTTPS** - Use in production
2. **Rate Limiting** - Prevent brute force attacks
3. **Input Validation** - Sanitize all inputs
4. **Environment Variables** - Never commit credentials
5. **JWT Expiration** - Set appropriate timeout
6. **CORS** - Restrict to trusted origins
7. **SQL/NoSQL Injection** - Use parameterized queries

---

## 📞 Support & Resources

- **FastAPI Docs:** http://localhost:8000/docs
- **Express.js:** https://expressjs.com
- **Leaflet.js:** https://leafletjs.com
- **Twilio:** https://www.twilio.com/docs
- **MongoDB:** https://docs.mongodb.com

---

## 🎉 You're All Set!

Your GeoValuator application now has:
✅ Secure OTP authentication
✅ Device tracking & security alerts
✅ Smart geocoding map search
✅ AI risk analysis engine
✅ Price prediction AI
✅ Encroachment detection
✅ Conversational AI chat interface
✅ Production-ready architecture

Happy coding! 🚀
