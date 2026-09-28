import { store } from '..';
import { onConfigure } from '../../config';
import { createMap } from './Create';

/**
 * Pre-init segment. Map factory arguments.
 * Needs revision and does not belong here. `#revise_me`
 */
const el = document.createElement('div');
el.id = 'map';
el.style.height = '100vh';
/*el.style.border = '4px inset';*/



/**
 * The map instance of the application.
 *
 * Built by `createMap` like any other, from the settings as they stand when this
 * bundle evaluates -- which is always the defaults, since `configure()` can only
 * run after it. What makes it the page's map is the rest of this file: `render`
 * puts it in the page, and a later `configure()` reaches it.
 *
 * @namespace Map
 */
export const Map = createMap(el);



/**
 * @extends segment. 
 * Extends Map.
 */
Map.render = function render(showHeaderAndFooter) {
    let container = document.getElementById(store.getState().map.id);
    container.appendChild(el);

    /**
     * Hack for lack of coordination between core and this plugin. 
     * Header and footer are forced to always render by core.
     * Hide them each time this plugin is initialized.
     * Show them whenever the plugin is uninitialized.
     * If the showHeaderAndFooter flag is passed, the map render function will not hide the perun-core header and footer.
     * #revise_me
     */
    if (!showHeaderAndFooter) {
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('footer').style.display = 'none';
    }

    return this.invalidateSize();
};

/**
 * Settings that describe this map rather than something read later, applied as
 * they change. This map's only: one from `createMap` took the settings when it
 * was built, and its caller moves it from there.
 *
 * Guarded on `changed` so that a `configure()` about something else does not
 * move the view: a deployment switching the scale bar to imperial should not
 * find its map recentred.
 */
onConfigure((values, changed) => {
    if (changed.has('crs')) Map.setCRS(values.crs);
    if (changed.has('minZoom')) Map.setMinZoom(values.minZoom);
    if (changed.has('maxZoom')) Map.setMaxZoom(values.maxZoom);
    if (changed.has('center') || changed.has('zoom')) Map.setView(values.center, values.zoom);
});
