import { util, store, Map, factory, http } from '..';
import { raster } from '../../data';

export const renderCycle = {
    start () {
        Map.render();
        raster({ 
            "Ортофото, Македонија 2017": factory.tileLayer.wms(
                'http://192.168.9.88:8080/geoserver/mk/wms', { 
                    layers: 'Macedonia_30cm',
                    format: 'image/png',
                    transparent: true,
                    tiled: true 
                }
            ).addTo(Map)
        }, {
            "Физички блокови": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'phy_block',
                    format: 'image/png',
                    transparent: true,
                    tiled: true 
                }
            ),
            "Земјишни парцели": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'lpis_parcel',
                    format: 'image/png',
                    transparent: true,
                    tiled: true 
                }
            ),
            "Административни единици": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'adm_units',
                    format: 'image/png',
                    transparent: true,
                    tiled: false 
                }
            ),
            "Патишта и железници": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'transport',
                    format: 'image/png',
                    transparent: true,
                    tiled: true 
                }
            ),
            "Реки": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'rivers',
                    format: 'image/png',
                    transparent: true,
                    tiled: true 
                }
            ),
        })
        // Get the bounding box of interest for this session. 
        // Regiser Map listeners, move frame to interest.
        http.call('origin').then(response => {
                Map.on('moveend', util.fn.debounce(() => {
                    store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
                },
                1000)).fitBounds(
                    factory.boundingBox(
                        store.dispatch({
                            origin: util.arr.normalize(response.data, Number)
                }))); 
            }).catch(err => {
                console.log(err)
                Map.on('moveend', util.fn.debounce(() => {
                    store.dispatch({ zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
                },
                1000))
            });
    },
    fetch () {},
    render () {},
    refresh () {}
};