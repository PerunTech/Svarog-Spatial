import { Util } from '../Util';
import { Map } from './Map';
import { store } from '../model/Store';
import { raster } from '../../Raster';
import { MAP_CONTAINER, MAP_CONFIG } from '../../Constants';

export const RenderCycle = {
    start() {
        Map.init(MAP_CONTAINER, MAP_CONFIG);
        raster();
        // getOrigin
        Map.register('moveend',  Util.debounce(() => {
            store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
        }, 1000));
    }, 

    fetch () {
        console.log(store.getState())
    },
    render () {},
    refresh () {}
};