# expo-metro-file-map-startup-window

A file created while the dev server starts, after `@expo/metro-file-map` has crawled the project and before its watcher listens, stays out of the file map until the server restarts. This repository is `npx create-expo-app@latest --template blank` (Expo 58.0.21, `@expo/metro-file-map` 58.0.5) with `npx expo install --fix` run once, and two changes:

- `metro.config.js` sets Metro's `unstable_perfLoggerFactory`, which Expo CLI hands to the file map, to a logger that deletes `created-during-startup.js` at the file map's `build_start` point and writes it at the point `CREATE_AT` names: by default `buildFileDelta_end`, after the crawl and before `watch_start`. This puts the write in that window on every start.
- `App.js` imports `./created-during-startup`.

## Steps

The development server, npm. The commands are PowerShell's.

1. Clone and install:
   ```powershell
   git clone https://github.com/YevheniiKotyrlo/expo-metro-file-map-startup-window
   cd expo-metro-file-map-startup-window
   npm install
   ```
2. Start the dev server and wait for `Waiting on http://localhost:8081`:
   ```powershell
   npx expo start
   ```
   `created-during-startup.js` is now on disk.
3. Open the app on a device or simulator, or request its bundle from a second window:
   ```powershell
   curl.exe -s -o NUL -w "%{http_code}`n" "http://localhost:8081/index.bundle?platform=ios&dev=true"
   ```

Expected: the bundle builds, since the file exists.

What I see on Windows 11 with Node 26.12.1: the request answers 500, and the dev server prints `Unable to resolve module ./created-during-startup from …\App.js`, on every start. With the file written once the watcher listens instead (`$env:CREATE_AT = 'watch_end'; npx expo start`), the bundle builds.
