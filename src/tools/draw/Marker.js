import { Map, factory } from '../../core';

export function drawMarker (opt = {}) {
    /** default configuration, merge argument. */
    const _opt = {
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
        marker: {/** use factory.marker.default.opt */},
        ...opt
    };

    // create visual hint as marker, trails mouse movement.
    const hint = factory.marker([0, 0], _opt.marker)
        .bindTooltip('new marker')
        .openTooltip()
        .addTo(Map); 

    // recalculates hint position when the mouse moves.
    function syncHint ({latlng}) { hint.setLatLng(latlng); }
    
    return {
        enable () {
            return Map.on({ click: this.disable, mousemove: syncHint })
                .fire('drawStart', { layer: hint });
        },

        disable () {
            return Map.fire('create', { layer: factory.marker(hint.getLatLng(), _opt.marker).addTo(Map) })
                .removeLayer(hint)
                .off({ click: this.disable, mousemove: syncHint }); 
        }
    };
}