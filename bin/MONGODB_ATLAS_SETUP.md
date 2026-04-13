# MongoDB Atlas Setup (Recommended - Cloud Database)

## Why MongoDB Atlas?

✅ **Free Tier** - 512MB storage for testing
✅ **No Installation** - Managed in the cloud
✅ **Automatic Backups** - MongoDB handles it
✅ **Easy Scaling** - Upgrade when needed
✅ **Global Infrastructure** - Fast access

---

## 🚀 Step-by-Step Setup

### Step 1: Create Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with email
4. Verify email
5. Log in

### Step 2: Create a Cluster

1. On the main page, click **"Create a Project"**
2. Project name: `GeoValuator`
3. Click **"Create Project"**
4. Click **"Create a Cluster"**
5. Choose **"Shared"** (Free option)
6. Select Region: **US East (N. Virginia)** (closest to Hyderabad)
7. Cluster Name: `geovaluator-cluster`
8. Click **"Create Cluster"**
9. Wait for cluster to deploy (~5-10 minutes)

### Step 3: Create Database User

1. In left sidebar, click **"Security"** → **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `geovaluator_user`
4. Password: Generate strong password (save it!)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

**Save your credentials:**
```
Username: geovaluator_user
Password: [your-generated-password]
```

### Step 4: Allow Network Access

1. Click **"Security"** → **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0) for development
4. Click **"Confirm"**

**Note:** For production, restrict to your IP only

### Step 5: Get Connection String

1. Click on your cluster
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://geovaluator_user:<password>@geovaluator-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update `.env`

Replace `<password>` with your actual password:

```env
MONGODB_URI=mongodb+srv://geovaluator_user:YOUR_PASSWORD_HERE@geovaluator-cluster.xxxxx.mongodb.net/geovaluator?retryWrites=true&w=majority
```

---

## ✅ Verify Connection

```powershell
# Navigate to server folder
cd d:\GEOVALUVATOR\server

# Start the backend (it will test MongoDB connection)
npm run dev

# Check console for:
# "✓ Connected to MongoDB" or similar success message
```

---

## 📊 Managing Your Database

### View Collections
1. In MongoDB Atlas dashboard
2. Click **"Browse Collections"**
3. You'll see:
   - `users` - Registered users
   - `lands` - Property records
   - And others...

### View Data
1. Click on a collection
2. See all documents
3. Click a document to view/edit

### Delete Test Data
1. Select a collection
2. Click document's 3 dots menu
3. Click "Delete"

---

## 🔐 Security Tips

1. **Use Strong Password** - MongoDB generates one for you
2. **Don't Commit `.env`** - Add to `.gitignore`
3. **Rotate Keys** - Change password every 3 months
4. **Production IP Whitelist** - Only allow your server IPs
5. **Enable IP Whitelist** - Don't use 0.0.0.0/0 in production

---

## 💰 Pricing

| Tier | Storage | Cost |
|------|---------|------|
| **M0 (Sandbox)** | 512 MB | FREE |
| **M2 (Small)** | 2 GB | $9/month |
| **M5 (Medium)** | 10 GB | $57/month |

Perfect for development and testing with the free tier!

---

## 🆘 Common Issues

### Connection Refused
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check internet connection
- Verify IP whitelist allows your IP
- Check username/password are correct
- Try resetting password

### Timeout Error
```
Error: connection timed out after 30000ms
```
**Solution:**
- Check MongoDB_URI in `.env`
- Network connectivity issue
- Try different MongoDB region
- Check firewall

### Authentication Failed
```
Error: authentication failed
```
**Solution:**
- Verify password is correct (use generated one)
- Check special characters are URL-encoded
- @ symbol should be fine
- Try creating new user

---

## 📈 Monitoring

MongoDB Atlas provides free monitoring:

1. Click **"Monitoring"** in sidebar
2. View:
   - Database size
   - Connection count
   - Operations per second
   - Network I/O
   - Query performance

---

## 🎓 Next Steps

1. ✅ Create cluster
2. ✅ Create database user
3. ✅ Allow network access
4. ✅ Get connection string
5. ✅ Update `.env`
6. ✅ Verify connection
7. ✅ Start application

---

**Status:** Ready to use with GeoValuator application! 🎉

