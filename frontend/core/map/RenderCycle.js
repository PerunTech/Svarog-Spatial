import { ReactDOM } from 'perun-core';
import { util, store, Map, factory } from '..';
import { raster } from '../../data';

export const renderCycle = {
    /**
     * Initialization protocol for the whole module.
     * Activated when the root React container is mounted.
     */
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
                    tiled: true , 
                    minZoom: 5,
                    maxZoom: 18
                }
            ),
            "Земјоделски парцели": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'lpis_parcel',
                    format: 'image/png',
                    transparent: true,
                    tiled: true, 
                    minZoom: 8,
                    maxZoom: 18 
                }
            ),
            "Административни единици": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'adm_units',
                    format: 'image/png',
                    transparent: true,
                    tiled: false, 
                    minZoom: 3,
                    maxZoom: 18
                }
            ),
            "Патишта и железници": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'transport',
                    format: 'image/png',
                    transparent: true,
                    tiled: true, 
                    minZoom: 3,
                    maxZoom: 18
                }
            ),
            "Реки": factory.tileLayer.wms(
                'http://192.168.100.155:8888/geoserver/mk/wms', { 
                    layers: 'rivers',
                    format: 'image/png',
                    transparent: true,
                    tiled: true, 
                    minZoom: 5,
                    maxZoom: 18
                }
            ),
        })
        const setMapState = () =>
            store.dispatch({  zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
        setMapState();

        Map.on('moveend', util.debounce(() => {
            setMapState();
        }, 1000));
    },

    fetch () {
        console.log(store.getState().map.bbox)
    },
    render () {},
    refresh () {},

    /**
     * Cleanup protocol for the whole module.
     * Called when the root React container is unmounted.
     */
    cleanup () {
        /* Containers embedded in the map, used as placeholders for UI elements (controls). */
        const controlNodes = Object.values(Map._controlCorners);

        controlNodes.map(el => {
            // Fixes virtual DOM of React.
            ReactDOM.unmountComponentAtNode(el); 
            
            // Removes all plain HTML elements attached to our control container,
            // which are not HTML containers themselves.
            [ ...el.children ].map(child =>
                !(controlNodes.includes(child)) && el.removeChild(child));
        });

        /**
         * Hack for lack of coordination between core and this plugin. 
         * Header and footer are forced to always render by core.
         * Hide them each time this plugin is initialized.
         * Show them whenever the plugin is uninitialized.
         */
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('footer').style.display = 'flex';
    }
};