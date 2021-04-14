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
            'Мапи и авионски снимки': {
                'Ортофото 2017 [380-740 nm]': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_30cm',
                        format: 'image/png',
                        transparent: true,
                        tiled: true
                    }
                ).addTo(Map),
                'Ортофото 2017 [IR 700-1100 nm]': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_30cm_cir',   // Macedonia_30cm_cir
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 0,
                        maxZoom: 18 
                    }
                ),
                'Ортофото 2009 [380-740 nm]': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_30cm_2009',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Ортофото 2009 [IR 700-1100 nm]': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_30cm_cir_2009',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Ортофото 2004 [380-740 nm]': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_30cm_2004',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Топографска карта': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_topo',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Модел на теренот, РМ 2017': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_dtm_2017',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Модел на теренот, РМ 2009': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_dtm_2009',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
            },
            'Сателитски снимки': {
                'ИПАРД, 10km x 10km, 2012-2015': factory.tileLayer.wms(
                    'http://192.168.9.88:8080/geoserver/mk/wms', { 
                        layers: 'Macedonia_dtm_2009',
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
            }
        }, {
            'СИЗП парцели': {
                'Физички блокови': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'ilpis',
                        format: 'image/png',
                        transparent: true,
                        tiled: true , 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
                'Земјоделски парцели': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'lpis_parcels',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 0,
                        maxZoom: 18 
                    }
                ),
            },
            'Катастар': {
                'Катастарски општини': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'cad_muni',
                        format: 'image/png',
                        transparent: true,
                        tiled: true , 
                        minZoom: 22,
                        maxZoom: 22
                    }
                ),
                'Катастарски парцели': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'cad_parcels',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 22,
                        maxZoom: 22 
                    }
                ),
                'Пресек на КП и ЗП': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'lpis_cad_intersections',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18 
                    }
                ),
            },
            'Административни единици': {
                'Граница на Р. Македонија': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'border',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
                'Општини': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'muni',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
                'Топографска мрежа 25км': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'tk25',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
            },
            'Обелжја на пејсажот': {
                'Точки': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'lf_points',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 8,
                        maxZoom: 18
                    }
                ),
                'Линии': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'lf_lines',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 8,
                        maxZoom: 18
                    }
                ),
                'Полигони': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'lf_polygons',
                        format: 'image/png',
                        transparent: true,
                        tiled: false, 
                        minZoom: 8,
                        maxZoom: 18
                    }
                ),
            },
            'Пасишта': {
                'Високопланински пасишта': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'highland_pastures',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
            },
            'Транспортна мрежа': {
                'Патишта': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'roads',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
                'Железници': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'railroads',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
            },
            'Почвена карта': {
                'Почвени типови': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'soil_types',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
            },
            'Заштитено подрачје': {
                'Природни споменици и национални паркови': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'npa',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
            },
            'Води': {
                'Реки': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'rivers',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 3,
                        maxZoom: 18
                    }
                ),
                'Водени површини 3m ': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'water_surface_3m',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Водени површини 10m': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'water_surface_10m',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Водени линии': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'water_lines',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Главни канали': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'main_canals',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Споредни канали': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'aux_canals',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Главни цевководи': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'main_pipelines',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
                'Споредни цевководи': factory.tileLayer.wms(
                    '/geoserver/mk/wms', { 
                        layers: 'aux_pipelines',
                        format: 'image/png',
                        transparent: true,
                        tiled: true, 
                        minZoom: 12,
                        maxZoom: 18
                    }
                ),
            }
        })
        const setMapState = () =>
            store.dispatch({  zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
        setMapState();

        Map.on('moveend', util.debounce(() => {
            setMapState();
        }, 1000));
    },

    fetch () {},
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