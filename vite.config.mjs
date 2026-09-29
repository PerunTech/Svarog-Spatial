import { defineConfig } from 'vite';

/**
 * The production bundle: one UMD file, `backend/www/spatial.js`.
 *
 * perun-core loads it as a plugin script and reads `window.spatial.spatial`, and
 * perun-atlas and lpis leave `spatial` to that global, so the format and the
 * global's name are the contract. perun-core is the shell's, published as a
 * window global by its own bundle, and is never bundled. Leaflet, its plugins,
 * proj4 and redux are: this is the one copy of Leaflet every bundle draws with.
 *
 * `.mjs` because this package has no `type` field, so a `.js` here would be read
 * as CommonJS.
 */

// A module standing in for a sheet. The id must not end in `.css`, or Vite's own
// CSS handling claims it and reads the generated JavaScript as a stylesheet.
const STYLE = '\0spatial-style:';
const AS_JS = '.js';
const INSERT = '\0spatial-style-insert';

/**
 * Each stylesheet a module imports becomes a `<style>` appended to `<head>`,
 * inserted when that module evaluates -- what style-loader did, one element per
 * sheet in import order, so the cascade is the one every deployment has been
 * running. Vite's own answer is a single extracted .css file, and nothing loads
 * one: the shell loads scripts.
 *
 * Images a sheet reaches with `url()` come inlined, as webpack's `asset/inline`
 * had them: library mode inlines every asset.
 */
function stylePerSheet() {
  return {
    name: 'spatial:style-per-sheet',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source === INSERT) return INSERT;
      if (!importer || !source.endsWith('.css')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved && STYLE + resolved.id + AS_JS;
    },
    load(id) {
      if (id === INSERT) {
        return [
          'export default function insert(css) {',
          '  const style = document.createElement("style");',
          '  style.textContent = css;',
          '  document.head.appendChild(style);',
          '}'
        ].join('\n');
      }
      if (!id.startsWith(STYLE)) return null;
      const sheet = id.slice(STYLE.length, -AS_JS.length);
      return [
        `import insert from ${JSON.stringify(INSERT)};`,
        `import css from ${JSON.stringify(sheet + '?inline')};`,
        'insert(css);'
      ].join('\n');
    }
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [stylePerSheet()],
  // redux reads it to choose its production build, and webpack's production
  // mode replaced it. Library mode leaves `process.env` for a downstream
  // bundler, and there is none: a browser runs this file as it is.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  oxc: {
    // Classic JSX: `React.createElement`, with React imported from perun-core.
    // The automatic runtime would import `react/jsx-runtime`, which is not
    // installed here and would be a second React if it were.
    jsx: { runtime: 'classic' }
  },
  build: {
    outDir: 'backend/www',
    // The directory also holds config.js, index.html and its .gitignore, and
    // the jar packages all of it.
    emptyOutDir: false,
    // perun-core's own bundle needs ES2020, so nothing runs this one where the
    // shell could not run.
    target: 'es2020',
    // lightningcss would lower the sheets' syntax for the target, and
    // deployments override them as written.
    cssMinify: false,
    lib: {
      entry: 'frontend/index.js',
      name: 'spatial',
      formats: ['umd'],
      fileName: () => 'spatial.js'
    },
    rolldownOptions: {
      external: ['perun-core'],
      output: {
        globals: { 'perun-core': 'perun-core' },
        // `window.spatial.__esModule`, as webpack set it, so a bundle that
        // default-imports spatial resolves it the way it always has.
        esModule: true,
        // Leaflet's @preserve notice, kept in the file that ships. Vite drops
        // legal comments when it minifies; webpack moved this one out to
        // spatial.js.LICENSE.txt, which was never committed.
        comments: { legal: true }
      }
    }
  }
});
