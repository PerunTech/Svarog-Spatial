import { util } from '../Util';
import { store } from '../model/Store';
import { Map } from './Map';
import { factory } from '../../Factory'
import { raster } from '../../Raster';
import { http } from '../../HTTP'
import { MAP_CONTAINER, MAP_CONFIG } from '../../Constants';

export const RenderCycle = {
    start() {
        // iniialize map
        Map.init(MAP_CONTAINER, MAP_CONFIG);
        // iniialize raster set
        raster();
        // Get this session bounding box of interest.
        // Added transform response callback, move fn implementation to some geometry api utils
        http.call('origin').then(response => {
            // Register map movement event
            Map.register('moveend',  util.debounce(() => {
                store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
            }, 1000));
            // Move map to response bounds
            Map.fitBounds(factory.boundingBox(response.data));
        }).catch(err => console.log(err));
    }, 

    fetch () {},
    render () {},
    refresh () {}
};