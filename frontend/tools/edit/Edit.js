import { Map } from '../../core';
import { provideToolset } from '../../core/map/Create';

/* shapes */
import { marker } from './shapes/Marker';
import { line } from './shapes/Line';
import { polygon } from './shapes/Polygon';

/**
 * The editing tools as templates, never enabled themselves, for the same
 * reason as the drawing tools': a tool keeps its state on itself.
 */
const templates = {
    marker,
    line,
    polygon
};

/**
 * A set of editing tools for one map.
 *
 * An editing tool works on the map of the layer it is enabled on (see
 * `mapOf`), so the map a set is built for is only its fallback, kept as
 * `_ownMap`, for a layer that is not on a map yet.
 *
 * Read as `map.edit`, which builds the set the first time it is read.
 *
 * @param {Object} map - The map the tools belong to.
 */
const editFor = (map) => {
    const set = {};
    Object.keys(templates).forEach(name => { set[name] = { ...templates[name], _ownMap: map }; });
    return set;
};

provideToolset('edit', editFor);

/**
 * Editing tools: the page's map's set, the same object as `Map.edit`. A map
 * from `createMap` has its own set, as `map.edit`.
 *
 * &nbsp;
 *
 * @namespace edit
 */
export const edit = Map.edit;
