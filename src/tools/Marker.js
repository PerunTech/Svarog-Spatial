import { Map, util, factory } from '../core'

/**
 * 
 * @param {*} opt 
 */
export function MarkerHandler (opt) {
    this.opt = util.clone(_opt, opt);
    this.hint = this.createHint();

    this.enable = () => {
        return Map.on({ click: this.disable.bind(this), mousemove: this.setPosition.bind(this) })
            .fire('drawStart', { /** Pass something meaningfull */ });
    };

    this.disable = () => {
        return this.renderMarker()
            .removeLayer(this.hint)
            .off({ click: this.disable, mousemove: this.setPosition }); 
    };
}

MarkerHandler.prototype = util.clone({
    // Fires marker creation event. Creates a marker entity and adds it to the map.
    renderMarker () { 
        return Map.fire('create', { 
            layer: factory.marker(this.hint.getLatLng(), this.opt.marker).addTo(Map) });
    },

    // create visual hint as marker, trails mouse movement.
    createHint () { 
        return factory.marker([0, 0], this.opt.marker)
            .bindTooltip(this.opt.tooltip)
            .openTooltip()
            .addTo(Map); 
    },

    // recalculates hint position when the mouse moves.
    setPosition ({latlng}) { return this.hint.setLatLng(latlng); }
}, { 
    constructor: MarkerHandler 
});

/**
 * Default configuration.
 * @private
 */
const _opt = {
    tooltip: {
        className: 'draw-marker-hint',
        permanent: true,
        offset: factory.point(0, 10),
        direction: 'bottom',
        opacity: 0.8
    },
    marker: {/** use iSpatial.marker.default.opt */}
};