import L from 'leaflet';

/**
 * Ref to the actual map instance.
 * 
 * @private
 */
let _map;

/**
 * Facade for the map implementation.
 * 
 * @public
 * @namespace Map
 */
export const Map = {
    /**
     * @constructs Map
     * 
     * @param {string | HTML_element} el - Id of a HTML-Element as string | the HTML-ELement itself.
     * @param {Object} [opt] - Configuration object.
     */
    init (el, opt = {}) {
        _map = L.map(el, opt)
        L.control.scale().addTo(_map); // move this somewhere else. Facade control? `#revise_me`
    },

    /**
     * Adds object to map.
     * 
     * All (read 'most') application constructs that belong on a map (use common sense)
     * own an `addTo(container)` method, thus the signature is asset.addTo(map).
     * We inverse this relationship to Map.add(asset) as a consequence of not working
     * with the map instance directly (see _map, top of file).
     * 
     * Its counterpart is `remove(asset)`.
     * 
     * &nbsp;
     * 
     * @function add (asset: Object): asset || Error
     * 
     * @param {Object} asset - The object to be added to the map.
     * 
     * @returns asset || Error; 
     */
    add (asset) {
        if (!asset.addTo) 
            throw new Error('This object does not belong in a map.');
        
        return asset.addTo(_map);
    },

    /**
     * Removes asset from the map.
     * `#revise_me`, add throwable, re-check asset logic. Untested.
     * 
     * &nbsp;
     * 
     * @function remove (asset: Object): asset
     * 
     * @param {Object} asset - The object to be removed from the map.
     * 
     * @returns asset;
     */
    remove (asset) { return asset.removeFrom(_map); },

    /**
     * Adds an event listener to the map.
     * 
     * &nbsp;
     * 
     * @function register (event: string, callback: Function, context?: Object): void
     * 
     * @param {string} event - Event type, represented as string.
     * @param {Function} callback - The function to be executed when the event fires.
     * @param {Object} [context] - The context of the function execution (the `this` object).
     * 
     * @returns void; 
     */
    register (event, callback, context) {
        _map.on(event, callback, context);
    },


    /**
     * Removes an event listener from the map.
     * 
     * &nbsp;
     * 
     * @function unregister (event: string, callback?: Function, context?: Object): void
     * 
     * @param {string} event - Event type, represented as string.
     * @param {Function} [callback] - The callback function to be removed for the specified event. 
     *            Omit in order to to remove all calbacks from a specified event.
     * @param {Object} [context] - The context of the function. If supplied on register,
     *            you must supply the same object here to succesfully remove.
     * 
     * @returns void;
     */
    unregister (event, callback, context) {
        _map.off(event, callback, context);
    },

    /**
     * Get the current bounding box of the map.
     * 
     * `#revise_me`, account for CRS difference | match between data and map.
     * This will not work with spherical projections, which use latitude / longitude (no x,y to be found).
     * Will need to reproject, especially when data is in different CRS than the Map.
     * 
     * &nbsp;
     * 
     * @function getBBox (): Bounding Box
     * 
     * @returns Bounding Box;
     */
    getBBox () {
        let psw = this.getBounds().getSouthWest();
        let pne = this.getBounds().getNorthEast();

        return psw.lat + ',' + psw.lng + ',' + pne.lat + ',' + pne.lng;
    },
    
    /**
     * Get the current bounds of the map.
     * 
     * &nbsp;
     * 
     * @function getBounds (): Bounds
     * 
     * @returns Bounds;
     */
    getBounds () { return _map.getBounds(); },

    /**
     * Get the current center of the map.
     * 
     * &nbsp;
     * 
     * @function getCenter (): LatLng
     * 
     * @returns LatLng;
     */
    getCenter () { return _map.getCenter(); },

    /**
     * An exit for the adventurous. Retrieves the current map instance.
     * 
     * If we need to tweak | override the prototype (do consider not to),
     * this is the access.
     * 
     * @function getInstance (): Map
     * 
     * @returns Map;
     */
    getInstance () { return _map; },

    /**
     * Get the required pane of the map.
     * If the argument is ommited, returns an object of all default panes.
     * 
     * &nbsp;
     * 
     * @function getPane (name?: string | HTML element): HTML element | Object
     * 
     * @param {string | HTML_element} [name] - The name of the pane, as string. 
     * 
     * @returns HTML element | Object;
     */
    getPane (name) { return name ? _map.getPane(name) : _map.getPanes(); },
    
    /**
     * Get the current zoom of the map.
     * 
     * &nbsp;
     * 
     * @function getZoom (): number
     * 
     * @returns number; 
     */
    getZoom () { return _map.getZoom(); },

    /**
     * Sets a map view that contains the given geographical bounds with the maximum zoom level possible.
     * 
     * &nbsp;
     * 
     * @function fitBounds (bounds: LatLngBounds, opt?: Object): Map
     * 
     * @param {LatLngBounds} bounds - The geographical bounds. as latitude / longitude pairs.
     * @param {Object} [opt] - Configuration object.
     * 
     * @returns Map;
     */
    fitBounds (bounds, opt = {}) { return _map.fitBounds(bounds, opt); },

    /**
     * Activate a flying animation which moves the map to the given center and zoom.
     * 
     * &nbsp;
     * 
     * @function flyTo (cnt: LatLng, zoom: number, opt?: Object ): Map
     * 
     * @param {LatLng} cnt - The map center to fly to, as a latitude / longitude pair.
     * @param {number} zoom - The zoom level to fly to.
     * @param {Object} [opt] - Configuration object.
     * @param {boolean} [opt.animate = true] - null: omit for animation if origin is in view,
     *                  false: no animation, true: animation always.
     * @param {number} [opt.duration = 10] - Duration of animated panning, in seconds.
     *                 Use higher than 3 for smooth animation transition.
     * @param {number} [opt.easeLinearity = 1] - The curvature factor of panning animation easing,
     *                 i.e. third parameter of the Cubic Bezier curve. 1.0 means linear animation,
     *                 and the smaller this number, the more bowed the curve.
     * @param {boolean} [opt.noMoveStart = true] - If true, panning won't fire movestart event on start,
     *                  used internally for panning inertia.
     * 
     * @returns Map;
     */
    flyTo (cnt, zoom, opt = {
        animate: true,
        easeLinearity: 1,
        duration: 10,
        noMoveStart: true}) {
            
        return _map.flyTo(cnt, zoom, opt);
    },

    /**
     * Sets the view of the map (geographical center and zoom) with the given animation options.
     * 
     * &nbsp;
     * 
     * @function setView (cnt: LatLng zoom: number, opt?: Object): Map
     * 
     * @param {LatLng} cnt - The map center to go to, as a latitude / longitude pair. 
     * @param {number} zoom - The zoom level.
     * @param {Object} [opt] - Configuration object.
     * @param {boolean} [opt.animate = null] - null: omit for animation if origin is in view,
     *                  false: no animation, true: animation always.
     * @param {number} [opt.duration = 0.25] - Duration of animated panning, in seconds.
     *                 Use higher than 3 for smooth animation transition.
     * @param {number} [opt.easeLinearity = 0.25] - The curvature factor of panning animation easing,
     *                 i.e. third parameter of the Cubic Bezier curve. 1.0 means linear animation,
     *                 and the smaller this number, the more bowed the curve.
     * @param {boolean} [opt.noMoveStart = false] - If true, panning won't fire movestart event on start,
     *                  used internally for panning inertia.
     * 
     * @returns Map;
     */
    setView (cnt, zoom, opt) { return _map.setVIew(cnt, zoom, opt); }
};

/**
 * <Notes>
 * 
 * Missing methods to be implemented:
 *  - Map.add(obj) 
 *  - Map.setOrigin()
 *  - Map.hasLayer()
 *  - Map.pm.enableDraw
 *  - Map.pm.disableDraw()
 */