# Svarog Spatial

Module for spatial data and map visualization.

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
globals were removed in 5.0; a deployment on svarog keeps these values as
`SPATIAL_*` system parameters, and perun-atlas resolves them and calls
`configure()` at startup.

Configure nothing and you get the whole world on the Web Mercator tile grid,
which is the grid basemaps are published on and belongs to no country. Before
5.0 you got Moldova's projection, centre and bounds instead.

`settings()` returns everything as it currently stands, for a console when a
deployment is behaving oddly.

## Third-party code

The drawing, editing and snapping tools are adapted from leaflet-geoman (MIT).
`NOTICE.md` says which files, what changed from upstream, and lists the other
files that carry a licence of their own.
