import { Map } from '../../core';
import { provideToolset } from '../../core/map/Create';

/* shapes */
import { marker } from './shapes/Marker';
import { circleMarker } from './shapes/CircleMarker';
import { line } from './shapes/Line';
import { polygon } from './shapes/Polygon';
import { rectangle } from './shapes/Rectangle';
import { circle } from './shapes/Circle';
import { cut } from './shapes/Cut';

/**
 * The drawing tools as templates. None of them is ever enabled: a tool keeps
 * its state on itself while it draws, so only copies are handed out.
 */
const templates = {
    marker,
    circleMarker,
    line,
    polygon,
    rectangle,
    circle,
    cut
};

/**
 * A set of drawing tools for one map.
 *
 * Each tool is a copy of its template with the map on it as `_map`, which is
 * where it listens, draws, snaps and fires `draw_start`, `draw_end` and
 * `new_shape`. Two sets share their methods and nothing else, so a line being
 * drawn on one map is not the line being drawn on another. They are copied
 * from the templates rather than from each other, so no set starts with state
 * another left behind.
 *
 * Read as `map.draw`, which builds the set the first time it is read.
 *
 * @param {Object} map - The map the tools draw on.
 */
const drawFor = (map) => {
    const set = {};
    Object.keys(templates).forEach(name => { set[name] = { ...templates[name], _map: map }; });
    return set;
};

provideToolset('draw', drawFor);

/**
 * Drawing tools: the page's map's set, the same object as `Map.draw`. A caller
 * using these and one using `Map.draw` share one set of tools, and so cannot
 * both be drawing a line at once. A map from `createMap` has its own set, as
 * `map.draw`.
 *
 * Reading `Map.draw` here needs the page's map built before this module runs.
 * It always is: the measurement dialogs in `ui` already add their layers to it
 * when they load, and `ui` is where core reaches `tools` from.
 *
 * &nbsp;
 *
 * @namespace draw
 */
export const draw = Map.draw;
