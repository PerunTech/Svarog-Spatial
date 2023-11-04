import { React } from 'perun-core';
import { store, Provider, MapContainer, control, Map } from '../core';
import { layerControl } from '../data';
import { NavigationControl, scale } from '../ui';

/**
 * 
 */
const _appBuilder = {
    withNavigationControl(props = {}, opt = {}) {
        control(NavigationControl, props, { position: 'bottomright', ...opt });

        return this;
    },

    withWindRose(opt = {}) {
        scale({ ...opt }).addTo(Map);

        return this;
    },

    addControl(ui, props, opt) {
        control(ui, props, opt);

        return this;
    },

    addRasterLayers(base = {}, overlay = {}, opt = {}) {
        layerControl(base, overlay, opt).addTo(Map);
        return this;
    },

    // If the showHeaderAndFooter flag is passed, the map render function will not hide the perun-core header and footer
    render(id, showHeaderAndFooter) {
        store.dispatch({ id: id })
        return <Provider children={<MapContainer showHeaderAndFooter={showHeaderAndFooter} />} />;
    }
}
_appBuilder.render.displayName = 'spatial-root';

/**
 * The spatial init function.
 * 
 * Provide a valid token to initialize.
 * Returns the _appBuilder object, callers can then call individual methods
 * on this object and shape the web map instance.
 * 
 * The order of the method calls does not matter, as long as _appBuilder.render is called last.
 */
export const init = token =>
    (store.dispatch({ token: token }), _appBuilder);