# GeoValuator Implementation - PowerShell Setup Guide

## ✅ Dependencies Already Installed!

```
✅ Node.js Backend: npm install completed
✅ React Frontend: npm install completed  
✅ Python AI Engine: pip install completed
```

---

## 🚀 Starting Services (PowerShell)

**Key Point:** Use **semicolons** (`;`) in PowerShell, NOT `&&`

### Terminal 1: Python AI Engine
```powershell
cd d:\GEOVALUVATOR\ai_engine; python main.py
```
Expect: `INFO:     Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: Node.js Backend (New PowerShell Window)
```powershell
cd d:\GEOVALUVATOR\server; npm run dev
```
Expect: `Server running on port 5000`

### Terminal 3: React Frontend (New PowerShell Window)
```powershell
cd d:\GEOVALUVATOR\client; npm run dev
```
Expect: `Local: http://localhost:5173/`

### Terminal 4: MongoDB (Choose One)

**Option A: MongoDB Atlas Cloud (Recommended)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/geovaluator`

**Option B: Local MongoDB**
```powershell
mongod
```

---

## ⚙️ Configuration (One-Time Setup)
### Terminal 2: Start Python AI Engine
```bash
cd ai_engine
pip install -r requirements.txt
python main.py
# Server: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Terminal 3: Start Node.js Backend
```bash
cd server
npm install
npm run dev
# Server: http://localhost:5000
```

### Terminal 4: Start React Frontend
```bash
cd client
npm install
npm run dev
# App: http://localhost:5173
```

---

## 📝 API Examples

### 1. Register User with OTP

**Step 1: Send OTP**
```bash
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "user@example.com",
    "type": "email"
  }'
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "user@example.com",
    "otp": "123456"
  }'
```

**Step 3: Register**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "password": "securepass123",
    "otp": "123456"
  }'
```

### 2. Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Response includes JWT token
# Use in Authorization header: Bearer {token}
```

### 3. Risk Analysis (AI Engine)
```bash
curl -X POST http://localhost:8000/analyze-risk \
  -H "Content-Type: application/json" \
  -d '{
    "owner_absence_days": 180,
    "has_boundary_wall": false,
    "nearby_disputes_count": 1,
    "location_tier": "Urban",
    "pixel_change_percentage": 15,
    "month": 6
  }'
```

### 4. Price Prediction (AI Engine)
```bash
curl -X POST http://localhost:8000/predict-price \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kukatpally",
    "sq_yards": 200
  }'
```

### 5. Encroachment Detection (AI Engine)
```bash
curl -X POST http://localhost:8000/detect-encroachment \
  -H "Content-Type: application/json" \
  -d '{
    "old_image_url": "https://example.com/old.jpg",
    "new_image_url": "https://example.com/new.jpg",
    "threshold": 0.15
  }'
```

---

## 🔧 Environment Configuration

### `.env` Template
```env
# Database
MONGODB_URI=mongodb://localhost:27017/geovaluator

# Authentication
JWT_SECRET=your-super-secret-key
PORT=5000

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# AI Engine
AI_ENGINE_URL=http://localhost:8000

# Frontend
REACT_APP_URL=http://localhost:5173
```

---

## 📁 Key Files Modified/Created

### Backend (Node.js)
- ✅ `server/controllers/authController.js` - NEW OTP/Login logic
- ✅ `server/models/User.js` - UPDATED with device tracking
- ✅ `server/routes/auth.js` - UPDATED with OTP routes
- ✅ `server/package.json` - UPDATED dependencies
- ✅ `.env` - NEW configuration file

### Frontend (React)
- ✅ `client/src/components/SmartMapSearch.jsx` - NEW
- ✅ `client/src/components/SmartMapSearch.css` - NEW
- ✅ `client/src/components/AIAgentChat.jsx` - NEW
- ✅ `client/src/components/AIAgentChat.css` - NEW

### AI Engine (Python)
- ✅ `ai_engine/main.py` - UPDATED with 3 endpoints
- ✅ `ai_engine/requirements.txt` - NEW/UPDATED

---

## 🎯 Feature Usage

### Smart Map Search
```jsx
import SmartMapSearch from './components/SmartMapSearch';

export default function Maps() {
  return <SmartMapSearch />;
}
```

Features:
- 🔍 Real-time location autocomplete
- 📍 Interactive Leaflet map
- 💰 Price prediction integration
- 🎯 Coordinate display

### AI Agent Chat
```jsx
import AIAgentChat from './components/AIAgentChat';

export default function Assistant() {
  return <AIAgentChat />;
}
```

Features:
- 💬 Conversational interface
- 🤖 Intent recognition
- 📊 Structured responses
- 💡 Quick suggestions

---

## 🔐 Security Features

1. **OTP Verification** (5-minute expiry)
   - Email OTP via Nodemailer
   - SMS OTP via Twilio

2. **Device Tracking**
   - Stores last IP address
   - Tracks device/browser info
   - Sends alert on new device login

3. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Secure password reset via OTP

4. **JWT Authentication**
   - Token-based auth
   - 7-day expiration
   - Protected routes

---

## 🧪 Test Scenarios

### Test 1: User Registration Flow
```
1. Send OTP to email
2. Check email for OTP
3. Verify OTP
4. Register with credentials
5. Receive JWT token
6. Login gets device/IP tracked
```

### Test 2: Risk Analysis
```
1. Enter: location + risk params
2. AI analyzes all factors
3. Get: risk score + recommendations
4. Display: detailed analysis card
```

### Test 3: Price Prediction
```
1. Enter: location + property size
2. AI calculates market value
3. Get: current + predicted values
4. Display: growth projections
```

### Test 4: Security Alert
```
1. User logs in from new device
2. System detects IP/Device mismatch
3. Security alert email sent
4. Login proceeds with JWT
```

---

## 📊 Database Queries

### Find User by Email
```javascript
const user = await User.findOne({ email: 'test@example.com' });
```

### Get User Login History
```javascript
const user = await User.findById(userId)
  .select('loginHistory lastIp lastDevice');
```

### Update Device Info
```javascript
await User.findByIdAndUpdate(userId, {
  lastIp: clientIp,
  lastDevice: deviceName,
  last_login: new Date()
});
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "OTP not received" | Check email in spam, verify Gmail app password |
| "Connection refused (8000)" | Ensure `python main.py` is running |
| "JWT expired" | Use refresh token or re-login |
| "CORS error" | Update CORS_ORIGIN in `.env` |
| "MongoDB connection failed" | Verify MongoDB is running, check URI |
| "Geocoding timeout" | Check internet connection, rate limits |

---

## 📈 Next Steps

1. **Deploy to Production**
   - Use Gunicorn for Python (instead of Uvicorn)
   - Use PM2/Forever for Node.js
   - Configure HTTPS certificates
   - Setup environment variables securely

2. **Database Scaling**
   - Use MongoDB Atlas (cloud)
   - Enable replication
   - Setup backups

3. **API Security**
   - Add rate limiting middleware
   - Implement API key authentication
   - Setup request logging
   - Add DDoS protection

4. **UI Enhancements**
   - Add dark mode
   - Mobile responsive improvements
   - Performance optimization
   - Accessibility improvements

---

## 📚 Documentation Links

- FastAPI: https://fastapi.tiangolo.com
- Express.js: https://expressjs.com
- Leaflet.js: https://leafletjs.com
- Pydantic: https://docs.pydantic.dev
- Nodemailer: https://nodemailer.com
- Twilio: https://www.twilio.com/docs

---

**Last Updated:** January 24, 2026
**Status:** ✅ Implementation Complete
