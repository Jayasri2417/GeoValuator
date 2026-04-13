# 🎯 GeoValuator - Next Steps (Copy-Paste Commands)

## ✅ Status: All Dependencies Installed!

```
✅ Node.js packages installed
✅ React packages installed
✅ Python packages installed
✅ Project ready to configure
```

---

## 📋 Step 1: Edit Configuration File

Open the configuration file and add your credentials:

```powershell
notepad d:\GEOVALUVATOR\.env
```

### Paste this template and fill in your values:

```env
# ============ DATABASE ============
# Use MongoDB Atlas (Free Cloud) - Recommended
MONGODB_URI=mongodb+srv://geovaluator_user:YOUR_PASSWORD@geovaluator-cluster.xxxxx.mongodb.net/geovaluator?retryWrites=true&w=majority

# OR use Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/geovaluator

# ============ EMAIL (Gmail) ============
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# ============ SMS (Twilio - Optional) ============
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890

# ============ AUTHENTICATION ============
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRATION=7d

# ============ PORTS ============
PORT=5000
NODE_ENV=development
```

---

## 🔧 Step 2: Get MongoDB Connection String

### Option A: MongoDB Atlas Cloud (RECOMMENDED - Free & Easy)

**2 minutes to setup:**

1. Open browser: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account
4. Create free cluster
5. Create database user:
   - Username: `geovaluator_user`
   - Password: (generate strong one)
6. Click "Connect" and copy connection string
7. Replace `<password>` in your `.env`

**Connection string format:**
```
mongodb+srv://geovaluator_user:YOUR_PASSWORD@geovaluator-cluster.xxxxx.mongodb.net/geovaluator?retryWrites=true&w=majority
```

### Option B: Local MongoDB

```powershell
# Download: https://www.mongodb.com/try/download/community
# Install with defaults
# MongoDB will run automatically

# In .env use:
MONGODB_URI=mongodb://localhost:27017/geovaluator
```

---

## 📧 Step 3: Get Gmail Credentials for Email OTP

**30 seconds:**

1. Open: https://myaccount.google.com/apppasswords
2. Select: "Mail" + "Windows Computer"
3. Click "Generate"
4. Copy 16-character password
5. Add to `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

---

## 📞 Step 4: Get Twilio Credentials (Optional)

Only if you want SMS OTP testing:

1. Open: https://www.twilio.com
2. Sign up free
3. Get Account SID
4. Get Auth Token
5. Get phone number
6. Add to `.env`:
   ```env
   TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

## 🚀 Step 5: Start All Services

### AUTOMATIC METHOD (Easiest - Recommended)

Run this single command in PowerShell:

```powershell
cd d:\GEOVALUVATOR
powershell -ExecutionPolicy Bypass -File startup.ps1
```

This will:
- ✅ Start Python AI Engine
- ✅ Start Node.js Backend
- ✅ Start React Frontend
- ✅ Open browser automatically

### MANUAL METHOD (If script doesn't work)

Open 4 separate PowerShell windows and run:

**Window 1 - Python AI Engine:**
```powershell
cd d:\GEOVALUVATOR\ai_engine
python main.py
```
Wait for: `INFO: Uvicorn running on http://127.0.0.1:8000`

**Window 2 - Node.js Backend:**
```powershell
cd d:\GEOVALUVATOR\server
npm run dev
```
Wait for: `Server running on port 5000`

**Window 3 - React Frontend:**
```powershell
cd d:\GEOVALUVATOR\client
npm run dev
```
Wait for: `Local: http://localhost:5173/`

**Window 4 - MongoDB (Only if using local MongoDB):**
```powershell
mongod
```

---

## ✅ Verify Everything is Running

Open a new PowerShell window and check each service:

```powershell
# Check Python AI Engine
Invoke-WebRequest http://localhost:8000/ | Select-Object StatusCode

# Check Node.js Backend
Invoke-WebRequest http://localhost:5000/ | Select-Object StatusCode

# Check React Frontend (open in browser)
start http://localhost:5173
```

All should return **Status Code: 200** (success)

---

## 🌐 Access the Application

Once all services are running:

| Component | URL | What to Test |
|-----------|-----|--------------|
| **Frontend** | http://localhost:5173 | Register with OTP |
| **Backend** | http://localhost:5000 | API endpoints |
| **AI Engine** | http://localhost:8000 | FastAPI |
| **AI Docs** | http://localhost:8000/docs | API documentation |

---

## 🧪 Test the Features

### Test 1: User Registration with OTP
```
1. Go to http://localhost:5173
2. Click "Register"
3. Enter email address
4. Check email for OTP (check spam folder)
5. Enter OTP and create password
6. Login with credentials
7. Check email for security alert (new device detected)
```

### Test 2: Map Search
```
1. Click "Smart Map Search" 
2. Search: "Jubilee Hills"
3. See map center on location
4. See price prediction card
5. See market sentiment
```

### Test 3: AI Chat
```
1. Click "AI Agent Chat"
2. Type: "What is the risk for my land in Jubilee Hills?"
3. Get risk analysis with recommendations
4. Try: "Predict price for 200 sq yards in Kukatpally"
5. Get price predictions
```

---

## 🆘 If Something Goes Wrong

### Error: "Cannot find MongoDB"
**Solution:** Use MongoDB Atlas (cloud) instead
- Follow Step 2, Option A above

### Error: "ECONNREFUSED port 5000"
**Solution:** Port is already in use
```powershell
# Find what's using it
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property @{Name="ProcessName";Expression={(Get-Process -Id $_.OwningProcess).Name}}

# Kill it
Stop-Process -Id <PID> -Force
```

### Error: "Email OTP not sending"
**Solution:** Verify credentials
- Use Gmail App Password (not regular password)
- Check email in `.env`
- Look in spam folder

### Error: "npm is not found"
**Solution:** Reinstall Node.js
- Download: https://nodejs.org
- Restart PowerShell after install
- Try again

### Error: "python is not found"
**Solution:** Reinstall Python
- Download: https://www.python.org/downloads
- Check "Add Python to PATH" during install
- Restart PowerShell after install

---

## 💡 Pro Tips

1. **Keep services running** - Don't close the PowerShell windows
2. **Check error messages** - They'll tell you what's wrong
3. **Test features one at a time** - Register, then login, then map search
4. **Use MongoDB Atlas** - No installation needed, free tier is perfect
5. **Gmail app password** - Don't use regular password, it won't work

---

## 📚 Need More Help?

Open these documentation files in order:

1. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Overview of all docs
2. **[POWERSHELL_SETUP_GUIDE.md](POWERSHELL_SETUP_GUIDE.md)** - Detailed guide
3. **[MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)** - Database setup
4. **[INTEGRATION_SETUP.md](INTEGRATION_SETUP.md)** - Full architecture

---

## ⏱️ Estimated Time

- MongoDB Atlas setup: 5 minutes
- Email setup: 1 minute
- Edit `.env`: 5 minutes
- Start services: 2 minutes
- **Total: ~15 minutes** ✅

---

## 🎉 You're Ready!

```
✅ All dependencies: Installed
✅ All documentation: Ready
✅ Configuration template: Created
✅ Startup script: Available
✅ Services: Ready to launch

>>> Ready to start? Run:
>>> cd d:\GEOVALUVATOR
>>> powershell -ExecutionPolicy Bypass -File startup.ps1
```

---

**Status:** ✅ Ready to Launch
**Last Updated:** January 24, 2026

