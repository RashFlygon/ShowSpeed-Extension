# ShowSpeed

ShowSpeed is a Chrome extension for Pokemon Showdown that adds on-hover tooltip speed tiers directly into the teambuilder.

## Features

### Hover speed tooltips
Hover a Speed stat or a Pokemon in search results to instantly see common Speed tiers at your chosen level.

### Teambuilder speed context
While editing a set or choosing a new pokemon to add in the teambuilder, ShowSpeed can show tooltips for common speed tiers and also Auto-Show speed boost modifers such as choice scarf.

### Speed creep helper
Type a target Pokemon, choose the benchmark you want to beat, and let ShowSpeed set the Speed EVs needed to speed creep it.

### Jump point markers
ShowSpeed can mark 1.1x nature jump points on the stat sliders so you can see efficient investment breakpoints.

### Popup settings
Use the extension popup to set the level and choose which tooltip sections appear.

### Champions mode
ShowSpeed can automatically switch into Champions mode for formats whose names include `[Champions]`. Champions mode uses level 50, fixed 31 IVs, and Stat Points instead of EVs for speed creep calculations.

## Usage Guide

### 1. Open the popup
Click the ShowSpeed extension icon to open the settings popup menu.

### 2. Choose your defaults
Set the battle level you care about, then toggle any of these options:
- `Minimum speed`
- `+1 speed`
- `+2 speed`
- `-1 speed`
- `Compact tooltip`
- `Colored labels`
- `Champions Mode`

### 3. Use hover tooltips in teambuilder
Open Pokemon Showdown teambuilder and hover:
- a Pokemon entry in search results
- the base Speed stat on a set
- the current Speed value on a set

ShowSpeed will display common benchmarks like positive-nature max Speed, neutral max Speed, unboosted Speed, and any enabled speed modifier sections.

### 4. Use the Speed creep tool
Inside a set:
- enter a target Pokemon
- choose the target level
- choose the target speed benchmark (+252, 252 neutral, unboosted)
- optionally enable `Use Champions mode` for level 50 / Stat Point calculations
- optionally include target boosts or your own boost
- click `Apply`

ShowSpeed will calculate the minimum Speed EVs needed to outspeed that target and apply them to the current set.

Use the `Jump points` checkbox near the team name to show or hide red jump-point markers on the stat sliders.

## Installation

### Load as an unpacked extension
1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select this project folder.

## Supported Sites

ShowSpeed runs on:
- `https://play.pokemonshowdown.com/`
- `https://smogtours.psim.us/`

## Project Structure

- `manifest.json` extension manifest
- `popup/` popup UI and saved settings controls
- `scripts/content.js` bridge between extension storage and the page
- `scripts/injected.js` in-page tooltip and Speed creep logic
- `icons/` extension icons
- `docs/` GitHub Pages privacy policy

## Privacy

ShowSpeed stores settings locally and does not use remote executable code.

Privacy policy:
- [ShowSpeed Privacy Policy](https://rashflygon.github.io/ShowSpeed-Extension/)

## Credits

Developed by Rasche.

Thanks to ElderFlower for the help.
