import { React } from 'perun-core';
import { store, Provider, MapContainer, control, Map } from '../core';
import { StatusBar, LayerPanel, ToolsBar, DataPanel, NavigationControl, scale } from '../ui';

/**
 * 
 */
const _appBuilder = {
    withStatusBar (props = {}, opt = {}) {
        control(StatusBar, props, { position: 'bottom', className: 'status-bar', ...opt });

        return this;
    },

    withToolsBar (props = {}, opt = {}) {
        control(ToolsBar, props, { position: 'top', ...opt });

        return this;
    },

    withLayerPanel (props = {}, opt = {}) {
        control(LayerPanel, props, { position: 'right', ...opt });
        
        return this;
    },

    withDataPanel (props = {}, opt = {}) {
        control(DataPanel, props, { position: 'left', ...opt });

        return this;
    },

    withNavigationControl (props = {}, opt = {}) {
        control(NavigationControl, props, {position: 'bottomright', ...opt});
        
        return this;
    },

    withWindRose (opt = {}) {
        scale({ metric: true, imperial: false, ...opt }).addTo(Map);

        return this;
    },

    render () {
        return <Provider children={<MapContainer />} />;
    } 
}
_appBuilder.render.displayName = 'spatial-root';

/**
 * 
 */
export const init = token =>
    (store.dispatch({token: token}), _appBuilder);