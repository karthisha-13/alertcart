# 🛒 AlertCart — Price Drop Notification System

Track product prices on Amazon, Flipkart, Myntra, Ajio, Nykaa, Tata, and Purplle.
Get email alerts when prices drop below your target!

---

## 📋 What You Need First

| Tool | Download Link |
|------|--------------|
| Node.js (v18+) | https://nodejs.org |
| MongoDB (if running locally) | https://www.mongodb.com/try/download/community |
| Docker Desktop (if using Docker) | https://www.docker.com/products/docker-desktop |
| Git (optional) | https://git-scm.com |

---

## 🚀 Method 1: Run with Docker (EASIEST — Recommended)

> Docker automatically sets up MongoDB + the app together. No manual MongoDB install needed.

### Step 1 — Install Docker Desktop
Download and install from: https://www.docker.com/products/docker-desktop
After install, open Docker Desktop and make sure it's running (green icon in taskbar).

### Step 2 — Open Terminal / Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter

### Step 3 — Go to the project folder
```bash
cd path/to/alertcart-updated
```
Example (Windows): `cd C:\Users\YourName\Downloads\alertcart-updated`
Example (Mac/Linux): `cd ~/Downloads/alertcart-updated`

### Step 4 — Edit the .env file
Open the `.env` file in any text editor (Notepad, VS Code, etc.) and fill in your Gmail:
```
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=AlertCart <youremail@gmail.com>
```

> ⚠️ **How to get Gmail App Password:**
> 1. Go to https://myaccount.google.com/security
> 2. Make sure **2-Step Verification** is ON
> 3. Search for **"App passwords"**
> 4. Create a new app password → select "Mail"
> 5. Copy the 16-character password and paste it as `EMAIL_PASS`

### Step 5 — Start the app
```bash
docker-compose up --build
```

Wait about 1-2 minutes for everything to start. You'll see:
```
🚀 AlertCart server running on http://localhost:3000
```

### Step 6 — Open the app
Open your browser and go to: **http://localhost:3000**

### Step 7 — Stop the app
Press `Ctrl + C` in the terminal, then:
```bash
docker-compose down
```

---

## 🖥️ Method 2: Run Locally (Without Docker)

> You need Node.js and MongoDB installed on your computer.

### Step 1 — Install Node.js
Download from https://nodejs.org and install (choose the LTS version).

### Step 2 — Install MongoDB
Download from https://www.mongodb.com/try/download/community and install.
After install, MongoDB runs automatically as a service on your computer.

### Step 3 — Open Terminal and go to project folder
```bash
cd path/to/alertcart-updated
```

### Step 4 — Edit the .env file
Open `.env` and:
1. **Comment out** the Docker MongoDB line by adding `#` at the start:
   ```
   # MONGO_URI=mongodb://mongo:27017/alertcart
   ```
2. **Uncomment** the local MongoDB line (remove the `#`):
   ```
   MONGO_URI=mongodb://localhost:27017/alertcart
   ```
3. Fill in your Gmail details (same as Docker Step 4 above)

### Step 5 — Install dependencies
```bash
npm install
```

### Step 6 — Start the app
```bash
npm start
```

You'll see:
```
🚀 AlertCart server running on http://localhost:3000
```

### Step 7 — Open the app
Open your browser and go to: **http://localhost:3000**

---

## 🌐 Supported Websites

| Website | Works? | Notes |
|---------|--------|-------|
| Amazon.in | ✅ | Works well |
| Flipkart.com | ✅ | Works well |
| Myntra.com | ⚠️ | May fail (JavaScript-heavy site) |
| Ajio.com | ⚠️ | May fail (JavaScript-heavy site) |
| Nykaa.com | ⚠️ | May fail sometimes |
| TataCliq.com | ⚠️ | May fail sometimes |
| Purplle.com | ⚠️ | May fail sometimes |

> **Note:** Amazon and Flipkart work most reliably. Other sites use JavaScript rendering which can block scraping.

---

## 📖 How to Use

1. Open **http://localhost:3000** in your browser
2. Paste a product URL from Amazon or Flipkart
3. Enter your **target price** (you'll get an email when price drops to or below this)
4. Enter your **email address**
5. Click **Track Product**
6. The app checks prices every 6 hours automatically

---

## 🔧 Extra Commands

```bash
# View running containers (Docker)
docker-compose ps

# See app logs (Docker)
docker-compose logs -f app

# Open MongoDB admin panel in browser (Docker only)
# Go to: http://localhost:8081
# Username: admin | Password: alertcart123

# Stop and remove everything (Docker)
docker-compose down -v

# Run with development auto-reload (local)
npm run dev
```

---

## ❓ Common Problems

**"Cannot connect to MongoDB"**
→ Make sure MongoDB is running. On Windows, search for "Services" and check "MongoDB Server" is running.

**"Email not sending"**
→ Double-check your Gmail App Password in the `.env` file. Regular Gmail password won't work — you need the App Password.

**"Port 3000 already in use"**
→ Change `PORT=3000` to `PORT=3001` in `.env` and access `http://localhost:3001`

**"Price could not be scraped"**
→ The website may have blocked scraping. Try Amazon or Flipkart URLs instead.
