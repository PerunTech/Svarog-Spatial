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
 * @type {number}
 */
export const R = 6371000;

/**
 * The minimum allowed scale for digitization.
 * 
 * The above means the furthest allowed distance from the surface of the Earth,
 * the constraint scale within the European Union is 1in5000, though 1in2000 is advised.
 * Simpler said, the user should not draw parcels when he can see half the country on the map.
 * 
 * `#revise_me`, see what internal scale number rougly corresponds to 1in5000,
 * once we implement the native CRS of the map.
 * 
 * @constant
 * @type {number}
 */
export const MIN_DIGI_SCALE = 12;

/**
 * The minimum allowed surface area of spatial entities that are stored.
 * The constraint area within the European Union is 100m2, i.e. 10x10 polygon. 
 * 
 * @constant
 * @type {number}
 */
export const MIN_DIGI_AREA = 100;

/**
 * @constant
 * @type {string}
 */
export const MAP_CONTAINER = 'mapContainer';

/**
 * @constant
 * @type {Object}
 */
export const MAP_CONFIG = {
    center: [41.3108238809182, 11.49169921875], // Tyrrhenian Sea
    zoom: 8,
    minZoom: 0,
    maxZoom: 18,
    dragging: true,
    zoomControl: true,
    doubleClickZoom: false,
    scrollWheelZoom: true,
    zoomAnimation: true,
    attributionControl: true,
    preferCanvas: false,
    keyboard: true,
    keyboardPanDelta: 80,
    tap: false,
    tapTolerance: 15,
};

/**
 * @constant
 * @type {string}
 */
export const MEASURE_LINE = {
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
        showMeasurements: true
    },
    // show a marker at the cursor
    cursorMarker: true,
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
        showMeasurements: true
    }
};

/**
 * @constant
 * @type {string}
 */
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

/**
 * @constant
 * @type {string}
 */
export const DRAW_PARCEL = {
    // snapping
    snappable: true,
    snapDistance: 20,
    // show tooltips
    tooltips: true,
    // allow snapping to the middle of segments
    snapMiddle: false,
    // self intersection
    allowSelfIntersection: true,
    // the vector that is currently being drawn
    templineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#0088AB',
        fillColor: '#0088AB',
        fillOpacity: 0.25,
        showMeasurements: true
    },
    // the temporary line from the last drawn marker to the mouse cursor
    hintlineStyle: {
        weight: 2.0,
        stroke: true,
        color: '#0088AB',
        fillColor: '#0088AB',
        fillOpacity: 0.25,
        dashArray: [5, 5],
        showMeasurements: true
    },
    // show a marker at the cursor
    cursorMarker: true,
    // specify type of layer event to finish the drawn shape
    // example events: 'mouseout', 'dblclick', 'contextmenu'
    finishOn: null,
    // configuration of the resulting vector, after drawing has finished.
    pathOptions: {
        weight: 2.0,
        stroke: true,
        color: '#0088AB',
        fillColor: '#0088AB',
        fillOpacity: 0.25,
        showMeasurements: true
    }
};

/**
 * @constant
 * @type {string}
 */
export const EDIT_PARCEL = {}

/**
 * @example
 * @constant
 * @type {string}
 */
export const MOCK_FORM = {
    schema: {
        "title": "A registration form",
        "description": "A simple form example.",
        "type": "object",
        "required": [
            "firstName",
            "lastName"
        ],
        "properties": {
            "firstName": {
                "type": "string",
                "title": "First name",
                "default": "Chuck"
            },
            "lastName": {
                "type": "string",
                "title": "Last name"
            },
            "age": {
                "type": "integer",
                "title": "Age"
            },
            "bio": {
                "type": "string",
                "title": "Bio"
            },
            "password": {
                "type": "string",
                "title": "Password",
                "minLength": 3
            },
            "telephone": {
                "type": "string",
                "title": "Telephone",
                "minLength": 10
            }
        }
    },
    uiSchema: {
        "firstName": {
            "ui:autofocus": true,
            "ui:emptyValue": ""
        },
        "age": {
            "ui:widget": "updown",
            "ui:title": "Age of person",
            "ui:description": "(earthian year)"
        },
        "bio": {
            "ui:widget": "textarea"
        },
        "password": {
            "ui:widget": "password",
            "ui:help": "Hint: Make it strong!"
        },
        "date": {
            "ui:widget": "alt-datetime"
        },
        "telephone": {
            "ui:options": {
                "inputType": "tel"
            }
        }
    }, 
    formData: {
        "firstName": "Chuck",
        "lastName": "Norris",
        "age": 75,
        "bio": "Roundhouse kicking asses since 1940",
        "password": "noneed"
    }
}