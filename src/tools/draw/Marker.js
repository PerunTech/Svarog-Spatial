import { Map, util, factory } from '../../core/index'

export const markerCreator = {
    enable (opt) {
        this.opt = util.clone({}, this.opt, opt)
        this.hint = this.createHint()

        return Map.on({ click: this.disable.bind(this), mousemove: this.setPosition.bind(this) })
            .fire('drawStart', { /** Pass something meaningfull */ });
    },

    disable () {
        return this.renderMarker()
            .removeLayer(this.hint)
            .off({ click: this.disable, mousemove: this.setPosition }); 
    }
}

Object.setPrototypeOf(markerCreator, {
    /** Default configuration object. Expose this */
    opt: {
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
        marker: {/** use iSpatial.marker.default.opt */}
    },

    // creates a marker entity.
    createMarker () { return factory.marker(this.hint.getLatLng(), this.opt.marker); },

    // adds the marker entity (look above) on the map and fires an event.
    renderMarker () { return Map.fire('create', { layer: this.createMarker().addTo(Map) }); },

    // create visual hint as marker, trails mouse movement.
    createHint () { 
        return factory.marker([0, 0], this.opt.marker)
            .bindTooltip(this.opt.tooltip)
            .openTooltip()
            .addTo(Map); 
    },

    // recalculates hint position when the mouse moves.
    setPosition ({latlng}) { return this.hint.setLatLng(latlng); }
})