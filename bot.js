require('dotenv').config();
const path = require('path');
const { exec } = require('child_process');
const mineflayer = require('mineflayer');

// Official Minecraft Java PC Launcher client ID
const MINECRAFT_JAVA_CLIENT_ID = '00000000402b5328';

let Titles = null;
try {
  Titles = require('prismarine-auth').Titles;
} catch {
  // prismarine-auth bundled inside mineflayer/minecraft-protocol
}

const SITE_URL = (process.env.SITE_URL || 'https://donutprofit.online').replace(/\/$/, '');
const BOT_SECRET = process.env.BOT_SECRET || '4d219fd961fde2fcbef18db91b57b8f361c355a4f5d2cebe90dfb753a1559b80';
const MC_EMAIL = process.env.MC_EMAIL;

if (!MC_EMAIL || MC_EMAIL.includes('your-cartisneakz')) {
  console.log('======================================================================');
  console.log('⚠️  SETUP REQUIRED: Please open the .env file in this folder and');
  console.log('   set MC_EMAIL to your actual Microsoft email for cartisneakz!');
  console.log('======================================================================');
  console.log('Press any key or close this window, edit .env, and launch again.');
  process.exit(1);
}

console.log('======================================================================');
console.log('🍩 CARTISNEAKZ DONUTPROFIT IN-GAME VERIFICATION BOT');
console.log('======================================================================');
console.log(`Server:            donutsmp.net`);
console.log(`Platform:          Minecraft PC (Java Edition / Microsoft Launcher)`);
console.log(`Minecraft Account: ${MC_EMAIL}`);
console.log(`Website Endpoint:  ${SITE_URL}/api/verify`);
console.log('======================================================================');

let bot = null;

function createBotInstance() {
  console.log(`\n[BOT] Connecting to donutsmp.net as ${MC_EMAIL}...`);
  console.log(`[BOT] Using PC Minecraft Java Edition Launcher authentication.\n`);

  const profilesFolder = path.join(__dirname, '.mc-auth-cache');

  bot = mineflayer.createBot({
    host: 'donutsmp.net',
    username: MC_EMAIL,
    auth: 'microsoft',
    authTitle: Titles?.MinecraftJava || MINECRAFT_JAVA_CLIENT_ID,
    deviceType: 'PC',
    flow: 'live',
    profilesFolder,
    onMsaCode: (data) => {
      const code = data.user_code;
      const directUrl = `http://microsoft.com/link?otc=${code}`;
      const fallbackUrl = data.verification_uri || 'https://www.microsoft.com/link';

      console.log('======================================================================');
      console.log('🔐 MINECRAFT PC LAUNCHER (MICROSOFT ACCOUNT) LOGIN');
      console.log('======================================================================');
      console.log('Microsoft will confirm you are signing into:');
      console.log('👉 "Minecraft: Java Edition" (PC)');
      console.log('----------------------------------------------------------------------');
      console.log(`1. CODE TO ENTER:  ${code}`);
      console.log(`2. DIRECT LINK:    ${directUrl}`);
      console.log(`3. BROWSER URL:    ${fallbackUrl}`);
      console.log('----------------------------------------------------------------------');
      console.log('Opening your browser automatically to sign in...');
      console.log('======================================================================\n');

      // Automatically open the default browser on Windows
      try {
        exec(`start "" "${directUrl}"`);
      } catch {
        // Fallback if exec blocked
      }
    },
  });

  function parseAmount(num, suffix) {
    const mult = { K: 1e3, M: 1e6, B: 1e9 }[(suffix || '').toUpperCase()] || 1;
    return Math.round(parseFloat(String(num).replace(/,/g, '')) * mult);
  }

  function extractPayment(text) {
    if (!text || typeof text !== 'string') return null;
    const cleanText = text.replace(/§[0-9a-fk-or]/gi, '').trim();

    // 1. Matches: "[Rank] username paid you $50,000,000" or "username paid you $10M"
    const m1 = cleanText.match(/(?:^|\]\s*|:\s*|\s)(\.?[a-zA-Z0-9_]{2,20})\s+paid you\s*\D{0,3}\s*([\d,.]+)\s*([KMBkmb])?/i);
    if (m1) {
      return { username: m1[1].replace(/^\./, ''), amount: parseAmount(m1[2], m1[3]) };
    }

    // 2. Matches: "You received $50,000,000 from username" or "You have received $50M from username"
    const m2 = cleanText.match(/You (?:have )?(?:received|been paid)\s*\D{0,3}\s*([\d,.]+)\s*([KMBkmb])?\s+(?:from|by)\s+(\.?[a-zA-Z0-9_]{2,20})/i);
    if (m2) {
      return { username: m2[3].replace(/^\./, ''), amount: parseAmount(m2[1], m2[2]) };
    }

    // 3. Fallback: anywhere in text has "user paid you amount"
    const m3 = cleanText.match(/(\.?[a-zA-Z0-9_]{2,20})\s+paid you\s*\D{0,3}\s*([\d,.]+)\s*([KMBkmb])?/i);
    if (m3) {
      return { username: m3[1].replace(/^\./, ''), amount: parseAmount(m3[2], m3[3]) };
    }

    return null;
  }

  async function handle(text) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.replace(/§[0-9a-fk-or]/gi, '').trim();

    // Log in-game payments or pay mentions
    if (/paid you/i.test(cleanText) || /pay/i.test(cleanText) || /received/i.test(cleanText)) {
      console.log(`[DONUTSMP RAW] ${JSON.stringify(cleanText)}`);
    }

    const payment = extractPayment(cleanText);
    if (!payment) return;

    const { username, amount } = payment;

    console.log(`\n💸 [PAYMENT DETECTED] Player: "${username}" paid: ${amount.toLocaleString()} coins!`);
    console.log(`[BOT] Forwarding verification to website: ${SITE_URL}/api/verify ...`);

    try {
      const res = await fetch(`${SITE_URL}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_SECRET}`,
        },
        body: JSON.stringify({ username, amount }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ [VERIFY SUCCESS] ${username} successfully verified & logged into DonutProfit!`);
      } else {
        console.log(`⚠️ [VERIFY REJECTED] HTTP ${res.status}: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(`❌ [VERIFY ERROR] Failed to contact website server (${SITE_URL}):`, e.message);
    }
  }

  bot.on('login', () => {
    console.log(`\n🟢 [SUCCESS] Logged into donutsmp.net as "${bot.username}"!`);
    console.log(`[BOT] Bot is active on DonutSMP and listening for player payments.`);
  });

  bot.on('messagestr', (msg) => handle(msg));
  bot.on('actionBar', (action) => handle(action.toString()));

  bot.on('error', (err) => {
    console.error('[BOT ERROR]', err.message || err);
  });

  bot.on('kicked', (reason) => {
    console.warn('\n[BOT KICKED]', reason);
  });

  bot.on('end', () => {
    console.warn('\n[BOT DISCONNECTED] Connection ended. Reconnecting in 5 seconds...');
    setTimeout(() => {
      if (process.env.PM2_HOME) {
        process.exit(1);
      } else {
        createBotInstance();
      }
    }, 5000);
  });
}

createBotInstance();
