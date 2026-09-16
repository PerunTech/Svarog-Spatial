import { getLabel } from '../ui/utils/labels';

/**
 * Mean Earth Radius = 6371000 m, as recommended for use by
 * the International Union of Geodesy and Geophysics.
 *
 * The Earth radius R varies from 6356.752 km at the poles to 6378.137 km at the equator.
 * Perhaps this number can be tweaked based on mean latitude of the project country,
 * in order to improve accuracy.
 * 
 * Expressed in meters [m].
 *
 * @constant
 */
export const R = 6371000;

/**
 * The minimum allowed scale for digitization.
 * 
 * The above means the furthest allowed distance from the surface of the Earth,
 * the constraint scale within the European Union is 1 in 5000, though 1 in 2000 is advised.
 * Simpler said, the user should not draw parcels when he can see half the country on the map.
 * 
 * @constant
 */
export const MIN_DIGI_SCALE = 12;

/**
 * The minimum allowed surface area of spatial entities that are stored.
 * The constraint area within the European Union is 100 m2, i.e. 10x10 polygon. 
 * 
 * @constant
 */
export const MIN_DIGI_AREA = 100;

/** @constant */
export const MAP_CONTAINER = 'mapContainer';

/**
 * How the map behaves, as opposed to where it is.
 *
 * Nothing here describes a deployment. The centre, the zoom and its limits, and
 * the coordinate reference system are settings, read from `configure()` where
 * the map is built — see `core/map/Map.js`. Keeping the two apart is the point:
 * this object is the same everywhere the engine runs, so a value that differs
 * between two installations does not belong in it.
 *
 * @constant
 */
export const MAP_CONFIG = {
    dragging: true,
    zoomControl: false,
    doubleClickZoom: false,
    scrollWheelZoom: true,
    zoomAnimation: true,
    attributionControl: false,
    preferCanvas: false,
    keyboard: true,
    keyboardPanDelta: 80,
    tap: false,
    tapTolerance: 15,
};

/** @constant */
export const MEASURE_CONFIG = {
    // allow multiple drawn shapes
    repeatable: true,
    // snapping
    snappable: true,
    snapDistance: 20,
    // show tooltips
    tooltips: true,
    // allow snapping to the middle of segments
    snapMiddle: false,
    // self intersection
    allowSelfIntersection: true,
    // the vector that is currently being drawn (while measurement is active).
    templineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#FFC400',
        fillColor: '#FFC400',
        opacity: 0.9,
        fillOpacity: 0.25,
        dashArray: [10, 10],
        showMeasurements: true
    },
    // the temporary line from the last drawn marker to the mouse cursor
    hintlineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#FFC400',
        fillColor: '#FFC400',
        opacity: 0.9,
        fillOpacity: 0.25,
        dashArray: [10, 10],
        /* This will enable runtime calculation of measurements on each new pixel location of the mouse cursor. */
        /* DO NOT ENABLE, impedes application performance, creates hundreds - thousands DOM elements each second. */
        /* showMeasurements: true */
    },
    // show a marker at the cursor
    cursorMarker: false,
    // specify type of layer event to finish the drawn shape
    // example events: 'mouseout', 'dblclick', 'contextmenu'
    finishOn: null
};

export const MEAUSURE_LENGTH = {
    ...MEASURE_CONFIG,
    // configuration of the resulting vector, after measurement finished. 
    pathOptions: {
        weight: 2.0,
        stroke: true,
        color: '#FFC400',
        fillColor: '#FFC400',
        opacity: 0.9,
        fillOpacity: 0.25,
        dashArray: [10, 10],
        showMeasurements: true,
        metadata: {
            type: 'measurements',
            /* Resolved on read rather than at import: labels arrive with the
               store, which is later than this module evaluates. */
            get name () { return getLabel('length'); },
            namePath: 'options.metadata.name'
        }
    }
}

/**
 * The circle a radius measurement leaves behind.
 *
 * `MEASURE_CONFIG` carries no `pathOptions`, and `draw.circle._finishShape`
 * reads exactly that key -- so a finished circle came out in Leaflet's default
 * blue while the length and area measurements beside it were amber and dashed.
 */
export const MEASURE_RADIUS = {
    ...MEASURE_CONFIG,
    pathOptions: {
        weight: 2.0,
        stroke: true,
        color: '#FFC400',
        fillColor: '#FFC400',
        opacity: 0.9,
        fillOpacity: 0.15,
        dashArray: [10, 10],
        showMeasurements: true,
        metadata: {
            type: 'measurements',
            /* Resolved on read rather than at import: labels arrive with the
               store, which is later than this module evaluates. */
            get name () { return getLabel('radius'); },
            namePath: 'options.metadata.name'
        }
    }
}

export const MEASURE_AREA = {
    ...MEASURE_CONFIG,
    // configuration of the resulting vector, after measurement finished. 
    pathOptions: {
        weight: 2.0,
        stroke: true,
        color: '#FFC400',
        fillColor: '#FFC400',
        opacity: 0.9,
        fillOpacity: 0.25,
        dashArray: [10, 10],
        showMeasurements: true,
        metadata: {
            type: 'measurements',
            /* Resolved on read rather than at import: labels arrive with the
               store, which is later than this module evaluates. */
            get name () { return getLabel('area'); },
            namePath: 'options.metadata.name'
        }
    }
}


/** @constant */
export const NAVIGATE_VIEW = {
    // snapping
    snappable: false,
    snapDistance: 20,
    // show tooltips
    tooltips: true,
    // allow snapping to the middle of segments
    snapMiddle: false,
    // self intersection
    allowSelfIntersection: true,
    // the vector that is currently being drawn (while measurement is active).
    templineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#00BFFF',
        fillColor: '#00BFFF',
        fillOpacity: 0.25,
        dashArray: [5, 5],
        // showMeasurements: true
    },
    // the temporary line from the last drawn marker to the mouse cursor
    hintlineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#00BFFF',
        fillColor: '#00BFFF',
        fillOpacity: 0.25,
        dashArray: [5, 5],
        // showMeasurements: true
    },
    // show a marker at the cursor
    cursorMarker: false,
    // specify type of layer event to finish the drawn shape
    // example events: 'mouseout', 'dblclick', 'contextmenu'
    finishOn: null,
    // configuration of the resulting vector, after measurement finished. 
    pathOptions: {
        weight: 2.0,
        stroke: true,
        color: '#00BFFF',
        fillColor: '#00BFFF',
        fillOpacity: 0.25,
        dashArray: [10, 10],
        // showMeasurements: true
    }
};