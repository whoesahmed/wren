<div align="center">

<br/>

# W R E N
### Wikipedia Research & Explanation Navigator

*Ask anything. Hear the answer. Know the world.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_WREN-1A1610?style=for-the-badge)](https://whoesahmed.github.io/wren)
[![Wikipedia](https://img.shields.io/badge/Powered_by-Wikipedia_API-000000?style=for-the-badge&logo=wikipedia&logoColor=white)](https://en.wikipedia.org)
[![License](https://img.shields.io/badge/License-MIT-8B6914?style=for-the-badge)](./LICENSE)

<br/>

> **[🚀 Try it live → whoesahmed.github.io/wren](https://whoesahmed.github.io/wren)**

<br/>

</div>

---

## What is WREN?

WREN is a free, open-source Wikipedia assistant that lives entirely in your browser. No sign-up. No install. No API key. Just open the link and start exploring the universe of human knowledge.

Type or speak any topic — WREN searches Wikipedia, summarises it in seconds, and reads the answer aloud.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Instant Search** | Real-time Wikipedia summaries on any topic |
| 🎤 **Voice Input** | Speak your query — no typing needed (Chrome / Edge) |
| 🔊 **Text-to-Speech** | Every answer read aloud automatically |
| 🌍 **3D Globe** | Live rotating Three.js globe background |
| ⌨️ **Typewriter Quotes** | Animated hero with rotating knowledge quotes |
| 🕐 **Search History** | Last 10 searches saved, persists across sessions |
| 📋 **Copy Button** | One-click copy on every answer |
| 📱 **Mobile Ready** | Fully responsive — works on any device |
| 🔁 **CORS Proxy Chain** | Works from any network — file, http, or https |
| ✦ **No Backend** | 100% frontend — hosted free on GitHub Pages |

---

## How to Use

**1.** Open the link → **[whoesahmed.github.io/wren](https://whoesahmed.github.io/wren)**

**2.** Enter your name when prompted

**3.** Type or speak any topic in the search bar

**4.** WREN finds the Wikipedia article and reads it to you

```
Example searches:

  "Black Holes"
  "History of Pakistan"
  "How does DNA work?"
  "The Silk Road"
  "Artificial Intelligence"
```

---

## How It Works

```
Your Query
    │
    ▼
Wikipedia w/api.php
    │
    ├── Exact match found?
    │       └── YES → Show full summary + Read aloud
    │
    └── No exact match?
            └── Search fallback → Top 3 related articles
                    │
                    └── Show with "Read more →" links
```

If your network blocks direct API calls, WREN automatically tries two CORS proxies as fallback — so it works everywhere including mobile browsers opening a local file.

---

## Tech Stack

```
Frontend        →  Vanilla HTML, CSS, JavaScript (no frameworks)
Search          →  Wikipedia REST API (free, no key required)
3D Globe        →  Three.js r128
Voice Input     →  Web Speech API (built into Chrome/Edge)
Text-to-Speech  →  SpeechSynthesis API (built into all browsers)
Font            →  Satoshi (Fontshare) + JetBrains Mono
Hosting         →  GitHub Pages (free)
```

Zero dependencies to install. Zero cost to run. Zero backend.

---

## Running Locally

No server needed — just open the file:

```bash
# Clone the repo
git clone https://github.com/your-username/wren.git
cd wren

# Open in browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

> 💡 For voice search and full API access, host on GitHub Pages or any web server rather than opening as a local file.

---

## Roadmap

- [x] Wikipedia search with smart fallback
- [x] Text-to-speech output
- [x] Voice search input
- [x] 3D animated globe
- [x] Search history with localStorage
- [x] Copy button on results
- [x] Mobile responsive
- [x] Typewriter animated quotes
- [ ] User authentication
- [ ] Cross-device history sync
- [ ] Dark mode
- [ ] PWA — installable on home screen
- [ ] Wikipedia thumbnail images
- [ ] Share result button

---

## Contributing

All contributions are welcome — bug fixes, new features, design improvements.

```bash
# Fork → Clone → Branch → Code → Push → Pull Request
git checkout -b feature/your-idea
git commit -m "Add your idea"
git push origin feature/your-idea
```

---

## License

MIT — free to use, modify, and share.

---

<div align="center">

<br/>

*"The curious mind never stops exploring."*

<br/>

**Built by Ahmed** · Pakistan 🇵🇰

<br/>

If WREN helped you learn something today, consider giving it a ⭐

</div>
