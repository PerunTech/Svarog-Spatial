import { Util } from './core/Util'
import { Map } from './core/map/Map';
import { store } from './core/model/Store'
import { raster } from './Raster'
// import { Factory } from './Factory'

export function initializeMap () {
    // Initalize Map
    Map.init('mapContainer', {
        center: [41.3108238809182, 11.49169921875],
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
        moveend: Util.debounce(() => {
            let zoom = Map.getZoom()
            let bbox = Map.getBBox()
            console.log(bbox)
            store.dispatch({type: 'zoomLevel', data: zoom})
            store.dispatch({type: 'mapBbox', data: bbox})
        }, 1000)
    });
    // render raster, getOrigin
    raster()
}

export function fetchVectors () {}

export function fetchRasters () {}

export function renderGeometry () {}

export function refreshGeometry () {}