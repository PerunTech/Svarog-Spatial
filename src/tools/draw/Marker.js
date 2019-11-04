import { Map, util, factory } from '../../core/index'

export const Marker = {
    enable (opt = {}) {
        // Configure handler, merge options. Either we clone to new object on every call,
        // or convert root to constructor and instantiate new handler on every draw action.
        const cfg = util.clone({}, this.opt, opt);

        // create visual hint as marker, trails mouse movement.
        const hint = factory.marker([0, 0], cfg.hint)
            .on('mousemove', e => { hint.setLatLng(e.latlng); })
            .bindTooltip(cfg.tooltip)
            .openTooltip()
            .addTo(Map);

        // Register events, describing the handler behavior.
        Map.on({click: e => {
            this.disable();
            
            return e.latlng
                ? Map.fire('create', { layer: factory.marker(hint.getLatLng(), cfg.marker).addTo(Map) })
                : Reflect.construct(Error, ['Location is invalid or unspecified.']);
        }});
    },

    disable () {
        // Must convert root to constructor
    },

    /** Default configuration object */
    opt: {
        hint: {},
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
        marker: {}
    }
}