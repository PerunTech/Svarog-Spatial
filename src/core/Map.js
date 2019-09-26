import { Core } from "./Core";
import  L  from 'leaflet'
import { IMap } from "../interface/IMap";

// keep internal ref of render map instance
// Do not provide constructor, this is a singleton. In JS an object literal {} is a singleton.
// Do not export the object literal, keep it private, so it cannot be cloned... ?



// provide layer get / set (add / remove)

// provide view get / set
// provide center get / set
// provide tileLayer get / set (add / remove)
// provide pane get / set

// provide calculateBBox get bbox

// provide panTo
// provide flyTo
// provide fitBounds

// provide L.control.layers get / set (add / remove) ?
// Map.pm.disableDraw ?
// Map.pm.enableDraw

/*
export const Map = new Core.extend(
    L.map().setView()
)
*/


/*
getCenter()	LatLng	
Returns the geographical center of the map view

getZoom()	Number	
Returns the current zoom level of the map view

getBounds()	LatLngBounds	
Returns the geographical bounds visible in the current map view

getMinZoom()	Number	
Returns the minimum zoom level of the map 
(if set in the minZoom option of the map or of any layers), or 0 by default.

getMaxZoom()	Number	
Returns the maximum zoom level of the map 
(if set in the maxZoom option of the map or of any layers).

getBoundsZoom(<LatLngBounds> bounds, <Boolean> inside?, <Point> padding?)	Number	
Returns the maximum zoom level on which the given bounds
fit to the map view in its entirety.
If inside (optional) is set to true, the method instead returns
the minimum zoom level on which the map view fits into the given bounds
in its entirety.

getSize()	Point	
Returns the current size of the map container (in pixels).

getPixelBounds()	Bounds	
Returns the bounds of the current map view in projected pixel coordinates
(sometimes useful in layer and overlay implementations).

getPixelOrigin()	Point	
Returns the projected pixel coordinates of the top left point of the
map layer (useful in custom layer and overlay implementations).

getPixelWorldBounds(<Number> zoom?)	Bounds	
Returns the world's bounds in pixel coordinates for zoom level zoom.
If zoom is omitted, the map's current zoom level is used.
*/

/*
export const Map = Core.extend(  L.map('mapContainer', {}), 
    function init () { this.test = 'I am a test member'; }
)
*/

export const Map = Core.extend({
    includes: [L.map('mapContainer', {center: [-34.568, 52.56789], zoom: 8}), {mixArray: 't1', mixArgs: 't2'}],
    init: function () {
        this.test = 'I am a test member';
    },
    
    getCenter () {
        console.log(' I have succesfully overriden map mixin .getCenter(), which is stupid');
        return super.getCenter(); //eslint-disable-line
    }
})   
