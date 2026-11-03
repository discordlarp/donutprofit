# 🍩 DONUTPROFIT — Donut SMP Community Casino Platform

A complete, production-ready Minecraft Donut SMP casino platform built with Next.js, TypeScript, and Tailwind CSS.

---

## ⚡ Quick Start (Run Locally)

1. Double-click **`LAUNCH_DONUTPROFIT.bat`** in `TOOLS/`  
   *OR* run in terminal:
   ```bash
   cd donutprofit
   npm run dev
   ```
2. Open your browser to: **`http://localhost:3000`**

---

## 👑 Designated Admin Accounts

Two official staff administrator accounts are pre-configured with full privileges:

| Email | Minecraft IGN | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`xynfnagsss@gmail.com`** | `xynfnagsss` | **ADMIN** | Supply coins, Ban players, Review deposits & payouts |
| **`gangsterjew7@gmail.com`** | `gangsterjew7` | **ADMIN** | Supply coins, Ban players, Review deposits & payouts |

### How to Sign In:
* Click **"Switch / Sign In"** in the top navigation bar.
* Click either of the **"Staff 1-Click Login"** buttons to immediately enter admin mode.
* You can also type the email or IGN directly into the Sign In box.

---

## 🛡️ Staff Admin Portal (`/admin`)

* **Supply Coins:** Select any player from the dropdown, enter an amount (+ or -), add a mandatory reason, and instantly credit/deduct coins with an audit record.
* **Player Ban Hammer:** Ban any user from playing games, depositing, or withdrawing. Banned players see an instant red ban notice explaining the reason. Unban anytime with one click.
* **Deposit Verification Queue:** View all in-game payment claims submitted by players. Click **Approve** to automatically credit coins, or **Reject**.
* **Withdrawal Fulfillment:** View player payout requests with the exact in-game `/pay <ign> <amount>` command. Click **Mark Paid** once completed.
* **Full Audit Trail:** Every single staff action (coin grant, ban, approval) is permanently recorded with admin name, timestamp, and explanation.

---

## 🎰 8 Interactive Casino Minigames

1. **Donut Coinflip:** 50/50 Glazed vs Chocolate 3D animated coin flip (1.96x payout).
2. **Donut Crash:** Live exponential curve, dynamic cashout button, up to 100x multiplier.
3. **Donut Mines:** 5x5 grid, customize 1-24 mines, cash out anytime before hitting a mine.
4. **Donut Roulette:** Red (2x), Black (2x), and Golden Donut (14x) with horizontal rolling reel.
5. **Blackjack 21:** Player vs Dealer with Hit, Stand, Double Down, and soft 17 rules.
6. **SMP Slots:** 3-reel high-energy slots matching Minecraft items (Donut, Crown, Diamonds).
7. **Custom Dice:** Slider from 1-98 to choose your own win chance and dynamic payout.
8. **Community Pot (Jackpot):** Live shared pot with ticking round countdown; winner takes all.

---

## 🚀 Deploying to Vercel & Connecting `donutprofit.online`

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial DonutProfit platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/donutprofit.git
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** &rarr; Click **Add New Project** &rarr; Select your `donutprofit` repository &rarr; Click **Deploy**.
3. In Vercel Project Settings &rarr; **Domains**:
   * Add: `donutprofit.online`
   * Add: `www.donutprofit.online`
4. In Namecheap **Advanced DNS**:
   * A Record: Host `@` &rarr; Value `76.76.21.21`
   * CNAME Record: Host `www` &rarr; Value `cname.vercel-dns.com`
