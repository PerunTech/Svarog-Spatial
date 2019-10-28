import { util } from '../Util';
import { Map } from './Map';
import { store } from '../model/Store';
import { raster } from '../../Raster';
import { http } from '../../HTTP'
import { MAP_CONTAINER, MAP_CONFIG } from '../../Constants';

export const RenderCycle = {
    start() {
        Map.init(MAP_CONTAINER, MAP_CONFIG);
        raster();
        http.call('origin').then(response => {
            console.log(response + 'dispatch origin to store.state');
            Map.register('moveend',  util.debounce(() => {
                store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
            }, 1000));
            Map.fitBounds(response.data);
        }).catch(err => console.log(err));
    }, 

    fetch () {},
    render () {},
    refresh () {}
};