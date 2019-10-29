import { util } from '../Util';
import { store } from '../model/Store';
import { Map } from './Map';
import { factory } from '../../Factory';
import { raster } from '../../Raster';
import { http } from '../../HTTP'
import { MAP_CONTAINER, MAP_CONFIG } from '../../Constants';


export const RenderCycle = {
    start() {
        // iniialize map.
        Map.init(MAP_CONTAINER, MAP_CONFIG);
        
        // iniialize raster set.
        raster();

        // Get the bounding box of interest for this session.
        // Pass custom callback to request, transform response before resolution in .then block.
        http.call('origin', {
            transformResponse: data => {
                // Generate array from string response and coerce each element to a number.
                return data.split(',').map(i => { return Number(i); });
            }
        }).then( ({data}) => {
            // Register map movement event listener.
            Map.register('moveend', util.debounce(() => {
                store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
            }, 1000));

            // Move map to response bounds.
            Map.fitBounds(factory.boundingBox(data));
        }).catch(err => console.log(err));
    }, 

    fetch () {},
    render () {},
    refresh () {}
};