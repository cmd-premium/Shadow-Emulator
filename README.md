# Shadow Emulator

A browser-based DOS emulator page built with [js-dos](https://js-dos.com/).

## Features
- Drag-and-drop `.exe` support
- File picker fallback
- Built-in **Game Library** with quick launch entries for public DOS/shareware archives
- In-browser DOSBox screen for gameplay

## Important compatibility notes
- This app can run **DOS-compatible** executables.
- Modern Windows `.exe` files are not compatible with in-browser DOSBox.
- Built-in library games are fetched from public URLs and depend on network availability / source uptime.

## Run locally
Use any static server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
