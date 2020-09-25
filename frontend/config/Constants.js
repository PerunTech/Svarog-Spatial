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
 * System bounds - spatial limits of the application.
 * 
 * Represented as simple latitude / longitutde pairs, first element is southwest corner,
 * second element is northeast, i.e. bottomleft and topright. Always represented spherically,
 * as this is what the render engine uses internally, regardless of the CRS of the data.
 * 
 * @constant
 */
export const SYS_BOUNDS = [{ lat: 40.794402, lng: 19.596202 }, { lat: 42.344569, lng: 24.017592 }];

/**
 * System center - a fallback point location for the map to center to. 
 * Represented as simple latitude / longitude pair.
 * 
 * @constant
 */
export const SYS_CENTER = { lat: 41.664956, lng: 21.674375 };

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

/**
 * Descriptor of the local coordinate reference system,
 * to be used in re-projections of assets and spatial operations.
 * 
 * @constant
 */
export const COORDINATE_REFERENCE_SYSTEM = {
    code: 'EPSG:6316',
    def: '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0'
        + ' +ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs',
    opt: {
        distances: [ 5000000, 2500000, 1000000, 750000, 500000,
            250000, 100000, 75000, 50000, 25000, 10000,
            7500, 5000, 2500, 1000, 750, 500, 250, 100 ],
        description: 'MGI 1901 / Balkans zone 7'
    }
}

/** @constant */
export const MAP_CONTAINER = 'mapContainer';

/** @constant */
export const MAP_CONFIG = {
    center: SYS_CENTER,
    zoom: 3,
    minZoom: 0,
    maxZoom: 18,
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
export const PROCESS_ENUM = {
    'zoom-in': 'zoom-in', 
    'zoom-out': 'zoom-out',
    search: 'search',
    origin: 'origin',
    location: 'location',
    view: 'view',
    draw: 'draw',
    edit: 'edit',
    cut: 'cut',
    split: 'split',
    merge: 'merge',
    landscape: 'landscape',
    length: 'length',
    area: 'area',
    angle: 'angle',
    radius: 'radius',
    erase: 'erase'
}  

/** @constant */
export const MEASURE_LINE = {
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
    finishOn: null,
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
            test: ''
        }
    }
};

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