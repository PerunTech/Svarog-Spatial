import { React } from 'perun-core';
import { store, Provider, MapContainer, control, Map } from '../core';
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