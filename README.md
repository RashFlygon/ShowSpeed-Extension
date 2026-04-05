# ShowSpeed

ShowSpeed is a Chrome extension for Pokemon Showdown that adds on-hover tooltip speed tiers directly into the teambuilder.

Features:
- Hover tooltips for base Speed and current Speed values, boosted speed values and minimum speed values
- A Speed Creep widget that calculates the EVs needed to outspeed a target
- A popup for enabling or disabling each view
- Auto choice scarf speed values

## Features

### Hover speed tooltips
Hover a Speed stat or a Pokemon in search results to instantly see common Speed tiers at your chosen level.

![Hover tooltip example 1](assets/readme-images/on-hover-view-1.png)

![Hover tooltip example 2](assets/readme-images/on-hover-view-2.png)

### Teambuilder speed context
While editing a set, ShowSpeed can show both standard Speed benchmarks and the current set's real Speed so you can compare at a glance.

![Teambuilder tooltip on current set](assets/readme-images/teambuilder-view-1.png)

### Speed creep helper
Type a target Pokemon, choose the benchmark you want to beat, and let ShowSpeed set the Speed EVs needed to outspeed it.

![Speed creep helper](assets/readme-images/teambuilder-view-2.jpg)

### Popup settings
Use the extension popup to set the level and choose which tooltip sections appear.

![Popup settings](assets/readme-images/popup-config.png)

## Usage Guide

### 1. Open the popup
Click the ShowSpeed extension icon in Chrome to open the settings popup.

### 2. Choose your defaults
Set the battle level you care about, then toggle any of these options:
- `Minimum speed`
- `+1 speed`
- `+2 speed`
- `-1 speed`
- `Compact tooltip`
- `Colored labels`

### 3. Use hover tooltips in teambuilder
Open Pokemon Showdown teambuilder and hover:
- a Pokemon entry in search results
- the base Speed stat on a set
- the current Speed value on a set

ShowSpeed will display common benchmarks like positive-nature max Speed, neutral max Speed, unboosted Speed, and any enabled boost sections.

### 4. Use the Speed creep tool
Inside a set:
- enter a target Pokemon
- choose the target level
- choose the target speed benchmark (+252, 252 neutral, unboosted)
- optionally include target boosts or your own boost
- click `Apply`

ShowSpeed will calculate the minimum Speed EVs needed to outspeed that target and apply them to the current set.

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
- `assets/readme-images/` screenshots used in this README
- `docs/` GitHub Pages privacy policy

## Privacy

ShowSpeed stores settings locally and does not use remote executable code.

Privacy policy:
- [ShowSpeed Privacy Policy](https://rashflygon.github.io/ShowSpeed-Extension/)

## Credits

Developed by Rasche.

Thanks to ElderFlower for the help.
