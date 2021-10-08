import { Map, store } from '../../core'
import { layerControl } from '..';

/**
 * The list of raster layers that are shown on the map.
 * 
 * This export is an instance of the internal `layer control`, avoid creating new instances.
 * Use the methods on this object to add / remove individual layers. These are:
 *  -   layerList.addBaseLayer
 *  -   layerList.addOverlay
 *  -   layerList.removeLayer
 *  
 */
export let layerList = layerControl({}, {}, store.getState().layerList).addTo(Map);