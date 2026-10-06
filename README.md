# Svarog Spatial

Module for spatial data and map visualization.

## Engine and components

spatial is a map engine: it configures, builds, projects, reads and draws on
maps. That is `config`; from `core`, the factory with its Leaflet plugins,
`http`, `util`, the store, `crs`, `projection`, `Map` and `createMap`; all of
`data`, the layer switcher included; and all of `tools`.

Its React components are frozen: all of `ui`, and from `core`, `control()`,
`renderCycle`, `MapContainer`, `connect` and `Provider`. They keep working on
the page's map as they do now and get a fix when something breaks, but nothing
new, and nothing teaches them about a second map. A later release removes them,
once nothing that loads `spatial.js` uses them. A new component, or a change to
one, belongs in perun-atlas, whose controls read the map they are on.

## Configuration

Everything that differs between two installations — the coordinate reference
system, where the map opens, how far it zooms, which units the scale bar uses —
is a setting, and settings arrive through one door:

```js
import { configure } from 'spatial/config';

configure({
    crs: 'EPSG:3857',
    center: { lat: 35.126411, lng: 33.429859 },
    bounds: [{ lat: 34.55, lng: 32.27 }, { lat: 35.70, lng: 34.60 }],
    zoom: 8,
    minZoom: 0,
    maxZoom: 18,
    measurementSystem: 'metric',
    switchBboxOrder: false
});
```

Partial updates are fine and the order of calls does not matter. Settings that
describe the map itself are applied to it as they change, so `configure()` works
before the map is drawn and after.

`crs` takes `'EPSG:3857'`, `'EPSG:3395'` or `'EPSG:4326'`, which the engine
resolves itself, or `{ code, def, opt }` carrying a proj4 definition for a
national grid. A national grid needs `opt.origin` — its own top-left corner, in
its own units — and one of `opt.scales`, `opt.resolutions` or `opt.distances`.
Leave either out and the engine warns and falls back to Web Mercator's, which
will not be right.

Nothing is read from the page. The `window.sysCrs`, `window.sysCenter`,
`window.sysBounds`, `window.measurementSystem` and `window.switchBboxOrder`
globals were removed in 4.2.1; a deployment on svarog keeps these values as
`SPATIAL_*` system parameters, and perun-atlas resolves them and calls
`configure()` at startup. `config.SYS_CENTER`, `config.SYS_BOUNDS` and
`MAP_CONFIG.minZoom` and `maxZoom` are still there for bundles built against
4.2.0, and answer with the settings; new code reads `setting()`.

Configure nothing and you get the whole world on the Web Mercator tile grid,
which is the grid basemaps are published on and belongs to no country. Before
4.2.1 you got Moldova's projection, centre and bounds instead.

`settings()` returns everything as it currently stands, for a console when a
deployment is behaving oddly.

## Maps

`core.Map` is the page's map, built when `spatial.js` loads.
`core.createMap(element, options)` builds another each time it is called:

```js
const { createMap } = spatial.core;

const map = createMap(container, { center: { lat: 41.99, lng: 21.43 }, zoom: 9 });
```

`element` is the element to build the map in, or its id. You own it and give it
its size, and nothing else on the page is touched. `options` are Leaflet map
options, laid over the engine's own and over the settings as they stand at the
call: `crs`, `center`, `zoom`, `minZoom` and `maxZoom`. `crs` takes any form
`configure()` takes, or a CRS. An option given as `undefined` leaves the setting
under it in place. A later `configure()` moves only the page's map; a created
map is yours, and you move it with `setCRS`, `setView` and the zoom limits.

Every map, the page's included, has `getCRS()`, `setCRS(crs)`,
`transform(latlng)`, `untransform(point)`, `getBBox()` and `setCursor(type)`.
Each works on the map it belongs to, and still does when passed on unbound.

### Drawing and editing

`map.draw` and `map.edit` are the map's own drawing and editing tools, the same
tools `tools.draw` and `tools.edit` hold. Each set is built the first time it is
read. A drawing tool draws on its own map, and its events fire there:

```js
map.on('new_shape', ({ shape, layer }) => { /* ... */ });
map.draw.polygon.enable();
```

An editing tool works on the map of the layer it is given, and snapping snaps
to the layers on that map only. The module-level `tools.draw` and `tools.edit`
are the page's map's sets (`tools.draw === Map.draw`). Only what is drawn on
the page's map writes the store, the digitising `minZoom` and the measurement
totals; tools on a created map leave it alone.

### GeoJSON on a map of its own

A GeoJSON layer reads its stored coordinates through the page's map's CRS, as it
stands when data is added. A layer for a created map on another CRS says so:

```js
factory.geoJSON(data, { crs: map.getCRS() }).addTo(map);
```

`crs` takes any form `configure()` takes, or a CRS. A `dbCRSCode` in the store
still wins wherever it names one of the three CRSs Leaflet carries.

### What stays on the page's map

These work on the page's map only, as they always have: `Map.render` and the
app builder `ui.init`; the render cycle and `MapContainer`, with the store's
`map` slice that it applies; every control added through `control()`; the older
measurement toolbar in `ui/measurement`; and `tools.limits`.

### Removing a map

When whatever built a map goes, call `map.remove()`. It takes with it
everything the engine added:

- the drawing and editing tools in `map.draw` and `map.edit`, turned off first
  if any is on, including a drawing tool told `repeatable`;
- every control on the map, the layer switcher and fullscreen included;
- every layer, and the listeners the engine and its tools put on them.

What you put on something outside the map is still yours to take off: a
listener on a layer you keep, on `document`, on `window`, or on another map.
A layer you keep outlives the map and can be added to another one.

## Versions

The version is the one in `backend/pom.xml`: the OSGi bundle svarog runs, with
`spatial.js` inside it, carries it as its `Bundle-Version`. `package.json` has
the same version, `-SNAPSHOT` included, and `spatial.version` reports it at
runtime.

A release drops the `-SNAPSHOT` from both, rebuilds `spatial.js`, and is tagged
with its number, as a lightweight tag (`4.2.1`). The next commit moves both to
the next snapshot. Push the release commit on its own first: CI deploys only
the commit at the head of a push, so pushed together with the snapshot it would
never be deployed.

A consumer depends on releases by tag:

```json
"spatial": "git+https://git@gitlab.prtech.mk/svarog4/svarog-spatial#semver:^4.2.1"
```

pnpm takes the newest tag in the range, and the lockfile records its commit.
`#4.2.1` pins one release. The tags have to stay lightweight: for an annotated
tag pnpm 9 and 10 record the tag's own hash and pnpm 11 the commit's, and
pnpm 11 then refuses a lockfile the others wrote.

## Building

Node 22.12 or newer, and pnpm.

```sh
pnpm install
pnpm run build     # backend/www/spatial.js, which is committed with each change
pnpm run dev       # the same, then again on every save
pnpm run lint      # what CI asks; lint:fix repairs your working tree instead
```

`spatial.js` is one UMD file publishing `window.spatial`, with perun-core left
to the shell's global. Its stylesheets travel inside it and are added to
`<head>` as it loads.

## Third-party code

The drawing, editing and snapping tools are adapted from leaflet-geoman (MIT).
`NOTICE.md` says which files, what changed from upstream, and lists the other
files that carry a licence of their own.
