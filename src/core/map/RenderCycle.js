import { util, store, Map, factory, http } from '../index';
import { raster } from '../../data';

export const renderCycle = {
    start() {
        Map.render(),
        raster(); //temp, `#revise_me`
        // Get the bounding box of interest for this session. 
        // Regiser Map listeners, move frame to interest.
        http.call('origin').then(response => {
                Map.register('moveend', util.debounce(() => {
                    store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
                }, 1000));

                Map.fitBounds(
                    factory.boundingBox(
                        store.dispatch({
                            origin: util.normalize(response.data, Number)
                }))); 
            }).catch(err => console.log(err));
    }, 

    fetch () {
        console.log('fetch')
        //mock for fetching vector data, fire sid on successful fetch cycle => which activates this.render().
        setTimeout(() => { 
            console.log('dispatch sid');
            store.dispatch({sid: Math.random()});
        }, 2000)
    },

    render () {
        console.log('render')
    },
    refresh () {
        console.log('refresh')
    }
};