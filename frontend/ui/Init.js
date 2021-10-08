import { React } from 'perun-core';
import { store, Provider, MapContainer, control, Map, factory } from '../core';
import { layerList } from '../data';
import { NavigationControl, scale } from '../ui';

/**
 * 
 */
const _appBuilder = {
    withNavigationControl (props = {}, opt = {}) {
        control(NavigationControl, props, {position: 'bottomright', ...opt});
        
        return this;
    },

    withWindRose (opt = {}) {
        scale({ metric: true, imperial: false, ...opt }).addTo(Map);

        return this;
    },

    addControl (ui, props, opt) {
        control(ui, props, opt);

        return this;
    },

    addRasterLayers (base = {}, overlay = {}, opt = {}) {
        // Merge configuration
        factory.setOptions(layerList, opt);

        // Add base layers
        for (let i in base) {
			for (let m in base[i]) {
				layerList.addBaseLayer(base[i][m], m, i);
			}
		}
        // Add overlays
        for (let o in overlay) {
			for (let n in overlay[o]) {
				layerList.addOverlay(overlay[o][n], n, o, true);
			}
		}

        return this;
    },

    render (id) {
        store.dispatch({id: id})
        return <Provider children={<MapContainer />} />;
    } 
}
_appBuilder.render.displayName = 'spatial-root';

/**
 * 
 */
export const init = token =>
    (store.dispatch({token: token}), _appBuilder);