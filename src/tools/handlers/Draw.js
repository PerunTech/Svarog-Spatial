import { Map } from '../../core';

/**
 * Shortcut to the drawing handler implementation.
 * @private 
 */
const _tool = Map.pm.Draw;

/**
 * Drawing tools.
 * 
 * &nbsp;
 * 
 * Implementation available on factory.PM.
 * Drawing is executed on the map and handlers will inject themselves 
 * on the map instance automatically, hence this utility will hook onto 
 * the map instance rather than factory.
 * 
 * Spread and hide utilities, so the caller need not know the reference shape
 * that is used internally. Call your function by type and configure the operation
 * via the `opt` argument.
 * 
 * @namespace draw  
 */
export const drawHandler = {
    marker (opt = {}) { return _tool.enable('Marker', opt); },

    line (opt = {}) { return _tool.enable('Line', opt); },

    polygon (opt = {}) { return _tool.enable('Polygon', opt); },

    rectangle (opt = {}) { return _tool.enable('Rectangle', opt); },

    circle (opt = {}) { return _tool.enable('Circle', opt); },

    circleMarker (opt = {}) { return _tool.enable('CircleMarker', opt); },

    cut (opt = {}) { return _tool.enable('Cut', opt); }
};