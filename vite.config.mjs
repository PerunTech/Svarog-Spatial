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
 *
 * Each sheet is squeezed before Vite reads it, rather than minified after.
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
    },
    transform(code, id) {
      if (!id.endsWith('.css?inline')) return null;
      return { code: squeeze(code), map: null };
    }
  };
}

// Whitespace next to these is never significant in CSS.
const SEPARATORS = '{};,';

/**
 * A sheet without its comments and runs of whitespace, and otherwise as
 * written: every token stays as it is. A minifier respells values, and
 * lightningcss writes `background: transparent` as `background: 0 0`, which
 * leaves `background-position` at `0px 0px` where the sheet leaves `0% 0%`.
 * Deployments override these sheets as written. Squeezing alone takes most of
 * what minifying would.
 */
function squeeze(css) {
  let out = '';
  let space = false;
  const put = (text) => {
    if (space && out && !SEPARATORS.includes(out.at(-1)) && !SEPARATORS.includes(text[0])) out += ' ';
    space = false;
    out += text;
  };
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '"' || c === "'") {
      let end = i + 1;
      while (end < css.length && css[end] !== c) end += css[end] === '\\' ? 2 : 1;
      put(css.slice(i, end + 1));
      i = end + 1;
    } else if (c === '\\') {
      put(css.slice(i, i + 2));
      i += 2;
    } else if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end < 0 ? css.length : end + 2;
      // `a/**/b` is two tokens, and `ab` would be one.
      if (!space && out && i < css.length && !/[\s{};,]/.test(out.at(-1) + css[i])) put('/**/');
    } else if (/\s/.test(c)) {
      space = true;
      i += 1;
    } else {
      put(c);
      i += 1;
    }
  }
  return out;
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
    // lightningcss would lower the sheets' syntax for the target and respell
    // their values, and deployments override them as written. `squeeze` takes
    // their whitespace out instead.
    cssMinify: false,
    // Vite's 500 kB default is meant for an app's chunks. This file is one
    // UMD script with Leaflet, its plugins and proj4 inside on purpose, and
    // was 560 kB when this was set. The limit is there to catch growth, such
    // as a second copy of Leaflet.
    chunkSizeWarningLimit: 600,
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
