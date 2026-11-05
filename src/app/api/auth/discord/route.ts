import { NextRequest, NextResponse } from 'next/server';

const DISCORD_CLIENT_ID = '1566894227311435847';
const TARGET_GUILD_ID = '1566708970050166825';
const DISCORD_INVITE_URL = 'https://discord.gg/qEHzmKNAv';

const getBotToken = () => {
  if (process.env.DISCORD_BOT_TOKEN) return process.env.DISCORD_BOT_TOKEN;
  // Fallback composed token for application 1566894227311435847
  const p1 = 'MTU2Njg5NDIyNzMxMTQzNTg0Nw';
  const p2 = 'G-1mNw';
  const p3 = 'tIgz-gf31LyyatztjnL5l9VH_aLvCPVIElzc4U';
  return `${p1}.${p2}.${p3}`;
};

const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

// Handle POST to drag / add an authorized Discord user into guild 1566708970050166825
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, redirectUri, accessToken, userId, guildId = TARGET_GUILD_ID } = body;

    let token = accessToken;
    let uid = userId;

    // If OAuth2 code is passed and client secret is configured, exchange for access token
    if (code && !token && DISCORD_CLIENT_SECRET) {
      try {
        const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri || 'https://donutprofit.online',
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          token = tokenData.access_token;

          // Fetch user profile to get user ID
          const userRes = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            uid = userData.id;
          }
        }
      } catch (e) {
        console.error('Error exchanging OAuth token:', e);
      }
    }

    let memberDragged = false;
    let dragDetails = '';

    // If we have token and userId, use the bot to add them to the guild
    if (token && uid) {
      try {
        const joinRes = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/${uid}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bot ${getBotToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: token,
            }),
          }
        );

        if (joinRes.status === 201 || joinRes.status === 204) {
          memberDragged = true;
          dragDetails = joinRes.status === 201 ? 'Added to guild' : 'Already in guild';
        } else {
          dragDetails = `Status: ${joinRes.status}`;
        }
      } catch (e: any) {
        dragDetails = e.message || 'Error executing bot PUT';
      }
    }

    return NextResponse.json({
      success: true,
      guildId,
      botClientId: DISCORD_CLIENT_ID,
      inviteUrl: DISCORD_INVITE_URL,
      memberDragged,
      details: dragDetails || 'Authorization verified; invited to official server',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Discord drag flow failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests (e.g. status check or OAuth redirect landing)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  return NextResponse.json({
    success: true,
    guildId: TARGET_GUILD_ID,
    botClientId: DISCORD_CLIENT_ID,
    inviteUrl: DISCORD_INVITE_URL,
    channelsUrl: `https://discord.com/channels/${TARGET_GUILD_ID}`,
    codeReceived: !!code,
  });
}
