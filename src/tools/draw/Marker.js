import { util, factory, Map } from '../../core'

export const drawMarker = {
    enable () {
        return Map.on({ click: this.disable.bind(this), mousemove: this.moveHint.bind(this) })
            .fire('drawStart', { /** Pass something meaningfull */ });
    },

    disable () {
        return this.renderMarker()
            .removeLayer(this.hint)
            .off({ click: this.disable, mousemove: this.moveHint }); 
    }
}

const proto = {
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
    moveHint ({latlng}) { return this.hint.setLatLng(latlng); }
};

