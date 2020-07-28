import { React } from 'perun-core';
import { store, Provider, MapContainer, control, Map } from '../core';
import { StatusBar, LayerPanel, ToolsBar, NavigationControl, scale } from '../ui';

/**
 * 
 */
const _appBuilder = {
    withStatusBar () {
        control(StatusBar, {}, {position: 'bottom', className: 'status-bar'});
        return this;
    },

    withToolsBar () {
        control(ToolsBar, {}, {position: 'top'});
        return this;
    },

    withLayerPanel () {
        control(LayerPanel, {}, { position: 'right' });
        return this;
    },

    withDataPanel () {
        return this;
    },

    withNavigationControl () {
        control(NavigationControl, {}, {position: 'bottomright'});
        return this;
    },

    withWindRose (opt = { metric: true, imperial: false }) {
        scale(opt).addTo(Map);
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