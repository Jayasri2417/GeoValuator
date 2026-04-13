# 🚀 GeoValuator - Complete PowerShell Startup Guide

## ✅ Current Status

All dependencies have been successfully installed:
- ✅ Node.js Backend (NPM packages)
- ✅ React Frontend (NPM packages)
- ✅ Python AI Engine (pip packages)

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** (v16+) - Run: `node --version`
- [ ] **Python** (v3.9+) - Run: `python --version`
- [ ] **MongoDB** - Either local or MongoDB Atlas cloud
- [ ] **.env file configured** with credentials

---

## ⚙️ Step 1: Configure `.env` File

Edit your configuration file:
```powershell
notepad d:\GEOVALUVATOR\.env
```

**Required Settings:**

```env
# ============ DATABASE ============
# Option A: MongoDB Cloud (Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geovaluator

# Option B: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/geovaluator

# ============ EMAIL (Gmail) ============
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Get app password from: https://myaccount.google.com/apppasswords
# (Select: Mail + Windows Computer)

# ============ SMS (Twilio - Optional) ============
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Sign up at: https://www.twilio.com

# ============ JWT ============
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRATION=7d

# ============ PORTS ============
PORT=5000
NODE_ENV=development
```

---

## 📱 Step 2: Setup MongoDB

### Option A: MongoDB Atlas Cloud (Easiest - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account
4. Create a free cluster (shared tier)
5. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` and `<username>`
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/geovaluator?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs automatically
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/geovaluator
   ```

---

## 📧 Step 3: Setup Email (OTP)

### Gmail (Free, Easy)

1. Go to https://myaccount.google.com/apppasswords
2. Select device: "Windows Computer"
3. Select app: "Mail"
4. Google generates 16-character password
5. Copy it to `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### AWS SES (Optional, More Reliable)

```env
EMAIL_SERVICE=aws-ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

---

## 📞 Step 4: Setup SMS (Twilio - Optional)

1. Go to https://www.twilio.com
2. Sign up for free account
3. Get credentials from dashboard:
   - Account SID
   - Auth Token
   - Phone Number
4. Update `.env`:
   ```env
   TWILIO_SID=ACxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

## 🎯 Step 3: Start All Services

### Method A: Manual (Recommended for Debugging)

Open 4 separate PowerShell windows and run in each:

**Window 1 - Python AI Engine:**
```powershell
cd d:\GEOVALUVATOR\ai_engine
python main.py
```

**Window 2 - Node.js Backend:**
```powershell
cd d:\GEOVALUVATOR\server
npm run dev
```

**Window 3 - React Frontend:**
```powershell
cd d:\GEOVALUVATOR\client
npm run dev
```

**Window 4 - MongoDB (Only if local):**
```powershell
mongod
```

### Method B: Automatic Script

Run the provided startup script:

```powershell
cd d:\GEOVALUVATOR
powershell -ExecutionPolicy Bypass -File startup.ps1
```

---

## ✅ Verify Services Are Running

Check each service is responding:

**Python AI Engine:**
```powershell
Invoke-WebRequest http://localhost:8000/ | Select-Object StatusCode
# Should return: 200
```

**Node.js Backend:**
```powershell
Invoke-WebRequest http://localhost:5000/ | Select-Object StatusCode
# Should return: 200
```

**React Frontend:**
```powershell
start http://localhost:5173
# Should open in browser
```

---

## 🌐 Access the Application

Once all services are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Web interface |
| **Backend API** | http://localhost:5000 | Node.js endpoints |
| **AI Engine** | http://localhost:8000 | FastAPI endpoints |
| **AI Documentation** | http://localhost:8000/docs | Interactive API docs |

---

## 🧪 Test the Application

### Test 1: Register with OTP
1. Go to http://localhost:5173
2. Click "Register"
3. Enter email (check spam folder for OTP)
4. Enter OTP and complete registration

### Test 2: Login
1. Login with your credentials
2. Check email for security alert (new device detected)
3. Receive JWT token

### Test 3: Map Search
1. Click "Smart Map Search"
2. Search for a location (e.g., "Jubilee Hills")
3. See price prediction and market sentiment

### Test 4: AI Chat
1. Click "AI Agent Chat"
2. Try: "What is the risk for my land in Jubilee Hills?"
3. Get risk analysis with recommendations

---

## ❌ Troubleshooting

### Problem: MongoDB Connection Error
```
Error: Error connecting to database
```
**Solution:**
```powershell
# 1. Check .env MONGODB_URI is correct
notepad d:\GEOVALUVATOR\.env

# 2. If using local MongoDB, ensure it's running:
mongod

# 3. Recommended: Use MongoDB Atlas (cloud) instead
# Sign up at: https://www.mongodb.com/cloud/atlas
```

### Problem: Port Already in Use (5000, 5173, 8000)
```powershell
# Find what's using the port (example: 5000)
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property @{Name="ProcessName";Expression={(Get-Process -Id $_.OwningProcess).Name}}

# Kill the process
Stop-Process -Id <PID> -Force
```

### Problem: Email Not Sending
```
Error: Failed to send OTP
```
**Solution:**
- Verify EMAIL_USER in `.env`
- Verify EMAIL_PASS (use Gmail App Password, not regular password)
- Check spam folder for test emails
- Ensure Gmail account is not locked

### Problem: npm Command Not Found
```powershell
# Reinstall Node.js from: https://nodejs.org
# After installation, restart PowerShell and try again
npm --version
```

### Problem: Python Modules Not Found
```powershell
# Reinstall Python dependencies
cd d:\GEOVALUVATOR\ai_engine
pip install -r requirements.txt --force-reinstall
```

### Problem: CORS Error (Frontend Can't Call Backend)
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
Check `.env` for:
```env
REACT_APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

## 📊 Expected Output When Running

### Python AI Engine (Startup)
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Node.js Backend (Startup)
```
Server running on port 5000
✓ Connected to MongoDB
```

### React Frontend (Startup)
```
VITE v5.0.0  ready in 350 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Enable HTTPS (SSL certificates)
- [ ] Use environment variables for all secrets
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Regular database backups
- [ ] Monitor logs and errors

---

## 📚 Learning Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Express.js:** https://expressjs.com/
- **React:** https://react.dev/
- **MongoDB:** https://docs.mongodb.com/
- **Leaflet.js:** https://leafletjs.com/
- **Nominatim API:** https://nominatim.org/

---

## 💬 Quick Commands Reference

```powershell
# Navigate to project
cd d:\GEOVALUVATOR

# Check Node version
node --version

# Check Python version
python --version

# Edit environment
notepad .env

# Start AI Engine
cd ai_engine; python main.py

# Start Backend
cd server; npm run dev

# Start Frontend
cd client; npm run dev

# Run all at once (new windows)
powershell -ExecutionPolicy Bypass -File startup.ps1

# Stop a service (Ctrl+C in the terminal)

# Check if ports are in use
Get-NetTCPConnection -LocalPort 8000

# Kill process on port
Get-Process | Where-Object {$_.Handles -gt 100} | Stop-Process -Force
```

---

## ✨ You're All Set!

```
✅ Dependencies: Installed
✅ Database: Configured
✅ Email: Configured
✅ Services: Ready to start
✅ Frontend: Ready to load
✅ Documentation: Complete

Ready for: Development & Testing 🚀
```

---

**Last Updated:** January 24, 2026
**Status:** ✅ Ready to Launch
**Support:** Check INTEGRATION_SETUP.md for detailed documentation

