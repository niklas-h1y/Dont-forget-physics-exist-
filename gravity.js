# Webpage Gravity Chaos 🌌

A fun, lightweight Manifest V3 browser extension that completely breaks standard web layouts by applying custom 2D gravity physics to every text block, image, link, and button on the screen!

## 🛠️ How it Works Under the Hood
1. **Background Service Worker**: Listens for the toolbar action click.
2. **DOM Liberation**: Converts elements to `fixed` positioning, stripping them from the structural page flow while preserving exact size and layout coordinates.
3. **Custom Engine Loop**: Utilizes `requestAnimationFrame` to apply a velocity matrix with gravity coefficients and ground-dampened boundary calculations.

## 🚀 How to Install and Test Locally
1. Clone or download this repository folder to your machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select this project folder.
6. Open any text-heavy website (like a news site or Google Search), click your extension icon, and watch it crumble!
