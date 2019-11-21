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


export const MAP_CONTAINER = 'mapContainer';

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