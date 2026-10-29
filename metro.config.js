const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Creates `created-during-startup.js` when the file map's startup span reaches CREATE_AT: by default the point after
// its crawl and before its watcher starts.
const createdFile = path.join(__dirname, 'created-during-startup.js');
const createAt = process.env.CREATE_AT ?? 'buildFileDelta_end';
const ignoredLogger = { point() {}, annotate() {}, start() {}, end() {}, subSpan: () => ignoredLogger };
const startupLogger = {
  ...ignoredLogger,
  point(name) {
    if (name === 'build_start') fs.rmSync(createdFile, { force: true });
    if (name === createAt) {
      fs.writeFileSync(createdFile, "export const createdDuringStartup = 'created during startup';\n");
    }
  },
  subSpan: () => startupLogger,
};
config.unstable_perfLoggerFactory = (type) => (type === 'START_UP' ? startupLogger : ignoredLogger);

module.exports = config;
