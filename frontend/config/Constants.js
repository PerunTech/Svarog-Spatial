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
export const SYS_BOUNDS = [{ lat: 45.44, lng: 26.63 }, { lat: 48.47, lng: 30.13 }];
/**
 * System center - a fallback point location for the map to center to. 
 * Represented as simple latitude / longitude pair.
 * 
 * @constant
 */
// export const SYS_CENTER = { lat: 45.44, lng: 26.63 };
export const SYS_CENTER = { lat: 47.184434, lng: 28.489772 };


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
    code: 'EPSG:4026',
    def: '+proj=tmerc +lat_0=0 +lon_0=28.4 +k=0.99994 +x_0=200000 +y_0=-5000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    opt: {
        distances: [2000000, 1000000, 545000, 273000, 136000, 68000, 34000, 17000, 8521, 4261, 4000, 3000, 2000, 1500, 1000, 500, 300, 100],
        description: 'MOLDREF99 / Moldova TM',
    },
    wkt: 'PROJCS["MOLDREF99 / Moldova TM",GEOGCS["MOLDREF99",DATUM["MOLDREF99",SPHEROID["GRS 1980",6378137,298.257222101],TOWGS84[0,0,0,0,0,0,0]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4023"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",28.4],PARAMETER["scale_factor",0.99994],PARAMETER["false_easting",200000],PARAMETER["false_northing",-5000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","4026"]]'
}

/** @constant */
export const MAP_CONTAINER = 'mapContainer';

/** @constant */
export const MAP_CONFIG = {
    center: SYS_CENTER,
    zoom: 2,
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
            name: 'Должина',
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
            name: 'Површина',
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