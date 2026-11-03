# DonutProfit Minecraft In-Game Verification System

This automated verification system allows players on **DonutSMP (`donutsmp.net`)** to verify their Minecraft accounts seamlessly without passwords or third-party OAuth logins.

---

## ⚡ How It Works

```
Visitor Browser                Next.js Backend (/api)                DonutSMP Mineflayer Bot
     |                                    |                                      |
     |---- 1. POST /api/signup --------->|                                      |
     |     { username: "Player" }         |                                      |
     |<--- 2. Command & Token ------------|                                      |
     |     "/pay cartisneakz <amt>"       |                                      |
     |                                    |                                      |
     |=== 3. Player runs command in DonutSMP chat =============================>|
     |                                    |                                      |
     |                                    |<--- 4. POST /api/verify -------------|
     |                                    |     Authorization: Bearer <SECRET>   |
     |                                    |     { username, amount }             |
     |                                    |                                      |
     |---- 5. GET /api/signup/status ---->|                                      |
     |<--- 6. { verified: true } ---------|                                      |
     |                                    |                                      |
     |=== 7. User logged in with 10M Coins & redirected to site! ===============|
```

---

## 📁 Files Created & Modified

### New Backend Endpoints & Storage
- `src/app/api/signup/route.ts`: Generates unique payment amount (100–999) with 10-minute expiry and security token. Rate-limited per IP.
- `src/app/api/verify/route.ts`: Secured webhook called by the Mineflayer bot. Validates `Authorization: Bearer <BOT_SECRET>`, matches exact username and amount, and marks the player verified.
- `src/app/api/signup/status/route.ts`: Polled by client every 2 seconds to check verification status.
- `src/lib/verificationDb.ts`: Persistent storage using SQLite (`data/verifications.db`) with disk JSON backup (`data/verifications.json`) and memory fallback.
- `bot.js`: Standalone Mineflayer bot listening on `donutsmp.net` for payment messages and forwarding to `/api/verify`.

### Updated Frontend Components
- `src/components/AuthModal.tsx`: Integrated automated verification into the modal with live countdown, 1-click copy command, pulsing bot listener status, and 2-second automatic polling.
- `src/context/GameContext.tsx`: Auto-creates and logs in verified players with their starting balance and referral bonus upon bot verification.

---

## ⚙️ Environment Variables (.env)

The `.env` file is located in the `donutprofit` directory (and excluded from Git via `.gitignore`):

```env
BOT_SECRET=4d219fd961fde2fcbef18db91b57b8f361c355a4f5d2cebe90dfb753a1559b80
MC_EMAIL=cartisneakz@donutprofit.online
SITE_URL=http://localhost:3000
```

- `BOT_SECRET`: Shared secret token between your Mineflayer bot and `/api/verify`.
- `MC_EMAIL`: The Microsoft email for the `cartisneakz` Minecraft account.
- `SITE_URL`: The website URL (e.g. `http://localhost:3000` locally, or `https://donutprofit.online` in production).

---

## 🚀 Running the Server & Bot

### 1. Start the Website Server

In PowerShell or Command Prompt:
```bash
cd "C:\Users\Old man\Downloads\TOOLS\donutprofit"
npm run dev
```
(or `npm run build && npm start` for production mode on port 3000).

---

### 2. Run the Bot Standalone

```bash
cd "C:\Users\Old man\Downloads\TOOLS\donutprofit"
node bot.js
```

Upon first run, Mineflayer will output a Microsoft Device Code login URL in the terminal (e.g. `https://microsoft.com/link` with a code). Log in with the `cartisneakz` account once, and subsequent logins will use the cached session.

---

### 3. Run the Bot with PM2 (Auto-Restart on Crash or Server Disconnect)

To keep the bot running 24/7 in the background:

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the bot under PM2 supervision
cd "C:\Users\Old man\Downloads\TOOLS\donutprofit"
pm2 start bot.js --name "cartisneakz-bot"

# View live bot logs
pm2 logs cartisneakz-bot

# Save PM2 process list to restart across server reboots
pm2 save
```

---

## 🧪 Local Testing Without Logging In In-Game

You can test the entire automated verification flow locally in 3 steps:

1. **Step 1: Open website and sign up**
   - Open `http://localhost:3000`
   - Click "Sign In" -> "Continue with Minecraft"
   - Type a username (e.g. `TestPlayer`) and click "Create Login"
   - Note the command shown, for example `/pay cartisneakz 482`

2. **Step 2: Simulate the bot payment webhook**
   Run this in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/verify" `
     -Method Post `
     -Headers @{ "Authorization" = "Bearer 4d219fd961fde2fcbef18db91b57b8f361c355a4f5d2cebe90dfb753a1559b80"; "Content-Type" = "application/json" } `
     -Body '{"username": "TestPlayer", "amount": 482}'
   ```

3. **Step 3: Watch the browser**
   - Within 2 seconds, the modal detects verification, fires confetti, logs the user in with 10M Donut Coins, and loads the casino dashboard automatically!
