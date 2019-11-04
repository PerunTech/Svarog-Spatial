import { Map, util, factory } from '../../core/index'

export const markerTool = {
    enable (opt = {}) {
        // Configure handler, merge options. Either we clone to new object on every call,
        // or convert root to constructor and instantiate new handler on every draw action.
        const cfg = util.clone({}, this.opt, opt),
            setPosition = ({latlng}) => hint.setLatLng(latlng), // recalculates hint position when the mouse moves.
            createMarker = () => factory.marker(hint.getLatLng(), cfg.marker), // creates a marker entity.
            renderMarker = () => Map.fire('create', { layer: createMarker().addTo(Map) }), // adds the marker entity (look above) on the map and fires an event.
            disable = () => renderMarker().removeLayer(hint).off({ click: disable, mousemove: setPosition }), // callback on click to disable handler, marker location is set.
            hint = factory.marker([0, 0], cfg.marker).bindTooltip(cfg.tooltip).openTooltip().addTo(Map);         // create visual hint as marker, trails mouse movement.

        // Register events, describing the handler behavior.
        Map.on({ click: disable, mousemove: setPosition }).fire('drawStart', { /** Pass something meaningfull */ });
    },

    /** Default configuration object */
    opt: {
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
        marker: {/** use iSpatial.marker.default.opt */}
    }
}