# LATENCY - Steam Deployment Guide

## Prerequisites
1. **Steamworks Account**: Sign up at https://partner.steampowered.com ($100 one-time fee)
2. **App ID**: Created after account approval (takes ~2 business days)
3. **SteamCMD**: Download from https://developer.valvesoftware.com/wiki/SteamCMD

## Build Commands

```bash
# Install dependencies (first time only)
npm install

# Build obfuscated production version
npm run build

# Package into Windows .exe installer
npm run package

# Output: dist/LATENCY Setup 1.0.0.exe
```

## Upload to Steam

1. Download and extract SteamCMD
2. Edit `steam/app_build.vdf` — replace `YOUR_APP_ID` with your actual Steam App ID
3. Edit `steam/depot_build.vdf` — replace `YOUR_DEPOT_ID` (usually App ID + 1)
4. Run:
```bash
steamcmd +login YOUR_STEAM_USERNAME +run_app_build steam/app_build.vdf +quit
```

## Store Page Checklist
- [ ] Game title: LATENCY
- [ ] Genre tags: RPG, Choose Your Own Adventure, Cyberpunk, Text-Based, Dark Fantasy
- [ ] Short description (under 300 chars)
- [ ] Long description with features
- [ ] At least 5 screenshots (1280x720 or 1920x1080)
- [ ] Header capsule image (460x215)
- [ ] Small capsule (231x87)
- [ ] Main capsule (616x353)
- [ ] Hero graphic (3840x1240)
- [ ] Logo (640x360)
- [ ] Age rating (likely Teen/Mature for violence themes)
- [ ] Pricing (set in Steamworks dashboard)

## What's Protected
- All JavaScript is obfuscated (variable names scrambled, control flow flattened, strings encrypted)
- Game files packaged in ASAR archive (not browseable)
- DevTools disabled in production build
- Content Security Policy blocks external script injection
- No source maps included
