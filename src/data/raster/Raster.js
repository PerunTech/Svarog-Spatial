import { Map, factory } from '../../core'

// self initialize, map is already rendered due to oreder of exports in entry root
export const raster = (function (base, overlay) {
    return factory.control.layers(base, overlay, {collapsed: false}).addTo(Map);
})({ 
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
