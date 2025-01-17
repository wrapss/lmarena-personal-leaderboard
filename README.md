# LM Arena Personal Leaderboard Browser Extension

Browser extension to track and manage your personal voting history on LM Arena platforms.

## Features

- Track votes across multiple LM Arena domains
- View personal leaderboard statistics
- Export/Import functionality
- Reset capabilities
- Support for Chrome and Firefox

## Project Structure

```
lmarena-personal-leaderboard/
├── package.json
├── webpack.config.js
├── src/
│   ├── chrome/
│   │   └── manifest.json
│   ├── firefox/
│   │   └── manifest.json
│   ├── common/
│   │   ├── content.js
│   │   ├── popup.js
│   │   └── popup.html
│   └── icons/
│       ├── icon-48.png
│       ├── icon-96.png
│       └── icon-128.png
└── README.md
```

## Installation

### From Release Package

#### Chrome

1. Download the latest `lmarena-personal-leaderboard-chrome.zip` from the [Releases page](https://github.com/wrapss/lmarena-personal-leaderboard/releases).
2. Unzip the file.
3. Go to `chrome://extensions/`.
4. Enable "Developer mode".
5. Click "Load unpacked" and select the unzipped folder.

#### Firefox

1. Download the latest `lmarena-personal-leaderboard-firefox.zip` from the [Releases page](https://github.com/wrapss/lmarena-personal-leaderboard/releases).
2. Go to `about:debugging#/runtime/this-firefox`.
3. Click "Load Temporary Add-on".
4. Select the ZIP file.

### From Source

1. Clone the repository:

   ```bash
   git clone https://github.com/[username]/lmarena-leaderboard.git
   ```

2. Install dependencies:

   ```bash
   cd lmarena-leaderboard
   npm install
   ```

3. Build for your browser:

   ```bash
   # For Chrome
   npm run build:chrome

   # For Firefox
   npm run build:firefox

   # For both
   npm run build
   ```

4. Load the extension:

   - **Chrome**: Load `dist/chrome` folder as unpacked extension.
   - **Firefox**: Load `dist/firefox` folder as temporary add-on.

## Usage

After installation:

1. Visit any supported LM Arena domain:
   - `web.lmarena.ai`
   - `lmarena.ai`
   - `chatbot-arena.web.app`

2. Vote on model comparisons.
3. Click the extension icon to view your personal leaderboard.
4. Use export/import to backup your data.

## Development

### Setup Development Environment

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

### Watch Mode for Development

Watch mode will automatically rebuild the extension when you make changes:

```bash
# For Chrome
npm run watch:chrome

# For Firefox
npm run watch:firefox
```

### Building for Production

```bash
# Build for both browsers
npm run build

# Build for specific browser
npm run build:chrome
npm run build:firefox
```

The built extensions will be in the `dist` directory:

- **Chrome**: `dist/chrome/lmarena-leaderboard-chrome.zip`
- **Firefox**: `dist/firefox/lmarena-leaderboard-firefox.zip`

## Contributing

1. Fork the repository.
2. Create your feature branch:

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. Commit your changes:

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. Push to the branch:

   ```bash
   git push origin feature/AmazingFeature
   ```

5. Open a Pull Request.
   
## Acknowledgments

- Thanks to the LM Arena team for their platform.
- All contributors who have helped make this extension better.