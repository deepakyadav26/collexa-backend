# MongoDB Atlas Connection Setup Guide

## Your Connection String
```
mongodb+srv://collexaUser:Shyam796@cluster1.v02vzpu.mongodb.net/collexaDB
```

## Step-by-Step Fix Guide

### Step 1: Update Your .env File

Create or update your `.env` file with the **complete connection string**:

```env
MONGO_URI=mongodb+srv://collexaUser:Shyam796@cluster1.v02vzpu.mongodb.net/collexaDB?retryWrites=true&w=majority
```

**Important:** Add the query parameters `?retryWrites=true&w=majority` at the end.

---

### Step 2: Fix IP Whitelist (MOST COMMON ISSUE)

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click on **Network Access** (left sidebar)
3. Click **Add IP Address** button
4. For development/testing:
   - Click **Allow Access from Anywhere**
   - OR manually add: `0.0.0.0/0`
   - Click **Confirm**
5. Wait 1-2 minutes for changes to propagate

**⚠️ Security Note:** `0.0.0.0/0` allows all IPs. For production, use specific IPs.

---

### Step 3: Verify Database User Permissions

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Find user `collexaUser`
3. Click **Edit**
4. Ensure user has:
   - **Atlas admin** OR
   - **Read and write to any database** OR
   - **Read and write** permissions for `collexaDB` specifically
5. Click **Update User**

---

### Step 4: Check Database Name

Your connection string uses database: `collexaDB`

Make sure:
- The database exists (it will be created automatically on first connection)
- OR create it manually in Atlas if needed

---

### Step 5: Test Connection

Run your server:
```bash
npm run dev
```

**Expected Output:**
```
MongoDB connected
Server running on port 5000
```

**If you see errors, check below:**

---

## Common Error Messages & Solutions

### Error 1: `MongoServerError: IP not whitelisted`
**Solution:** Follow Step 2 above (IP Whitelist)

### Error 2: `MongoServerError: Authentication failed`
**Solutions:**
- Verify username: `collexaUser`
- Verify password: `Shyam796`
- Check if password has special characters (may need URL encoding)
- Reset password in Database Access if needed

### Error 3: `MongoNetworkError: connection timeout`
**Solutions:**
- Check your internet connection
- Verify firewall/antivirus isn't blocking MongoDB
- Try connecting from MongoDB Compass to test

### Error 4: `MongooseServerSelectionError`
**Solutions:**
- Check if cluster is running (not paused)
- Verify connection string format
- Ensure query parameters are added: `?retryWrites=true&w=majority`

### Error 5: `MongoParseError: Invalid connection string`
**Solutions:**
- Remove any extra spaces or quotes in `.env` file
- Ensure no line breaks in connection string
- Check for special characters in password (URL encode if needed)

---

## Password with Special Characters

If your password contains special characters, URL encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |

**Example:**
If password is `Pass@123`, use: `Pass%40123`

---

## Complete .env File Example

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://collexaUser:Shyam796@cluster1.v02vzpu.mongodb.net/collexaDB?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Testing Connection with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your connection string:
   ```
   mongodb+srv://collexaUser:Shyam796@cluster1.v02vzpu.mongodb.net/collexaDB
   ```
3. Click **Connect**
4. If it connects, your connection string is correct
5. If it fails, the error message will tell you what's wrong

---

## Quick Checklist

- [ ] `.env` file created with correct `MONGO_URI`
- [ ] Connection string includes `?retryWrites=true&w=majority`
- [ ] IP address whitelisted in MongoDB Atlas (Network Access)
- [ ] Database user has correct permissions
- [ ] Cluster is running (not paused)
- [ ] No special characters in password (or properly URL encoded)
- [ ] Server starts without connection errors

---

## Still Having Issues?

1. **Check MongoDB Atlas Status:**
   - Go to your cluster
   - Ensure it's not paused
   - Check for any alerts/warnings

2. **Test with MongoDB Compass:**
   - If Compass connects, issue is in your code
   - If Compass fails, issue is with Atlas configuration

3. **Check Server Logs:**
   - Look at the full error message
   - Copy the exact error and search online

4. **Reset Database User:**
   - Delete and recreate `collexaUser` in Database Access
   - Update password in `.env` file
