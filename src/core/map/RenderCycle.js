import { util, store, Map, factory, http } from '..';

export const renderCycle = {
    start() {
        Map.render();
        // Get the bounding box of interest for this session. 
        // Regiser Map listeners, move frame to interest.
        http.call('origin').then(response => {
                Map.on('moveend', util.debounce(() => {
                    store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
                },
                1000)).fitBounds(
                    factory.boundingBox(
                        store.dispatch({
                            origin: util.normalize(response.data, Number)
                }))); 
            }).catch(err => console.log(err));
    },
    fetch () {},
    render () {},
    refresh () {}
};