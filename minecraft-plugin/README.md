# DonutProfit Verification Plugin

This plugin is a starter for DonutSMP account verification.

## What it does
- watches for recent payment records
- checks payer IGN
- checks receiver IGN
- checks exact amount
- marks a player as verified if it matches the configured amount and receiver

## Config
The default check is:
- receiver: `cartisneakz`
- required amount: `430`
- window: `12 hours`

You can edit these in the generated `config.yml` after the plugin is first run.

## Hand-off flow
1. Put the jar into your Paper server `plugins/` folder.
2. Start the server once so it generates the config and log files.
3. Wire the plugin into your actual economy/pay event or your server economy plugin.
4. Make sure each valid `/pay cartisneakz <amount>` is logged in the plugin payment file.
5. The website backend can query the plugin log or a shared verification endpoint.

## Important note
This is a server-side verification scaffold. The browser alone cannot be trusted for payment validation.

To make it fully real, the plugin should be connected to the actual pay/economy event on your Minecraft server and your website backend should call that verification endpoint before unlocking the account.

## Build
On a machine with Gradle installed:

```bash
gradle build
```

The output jar will be generated as:

```text
build/libs/DonutProfitVerification.jar
```
