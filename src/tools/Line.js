import { util, factory, Map, iSpatial } from "../core";

export const line = util.inherit({
    opt: {
        line: {},
        hintLine: {},
        hintMarker: {
            icon: iSpatial.divIcon({ className: 'marker-icon cursor-marker' })
        },
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
    },

    createHintMarker () {
        return factory.marker(Map.getCenter(), this.opt.hintMarker)
            .bindTooltip(this.opt.tooltip)
            .openTooltip();
    }
});

util.clone(line, {
    enable (opt) {
        // Set configuration.
        this.opt = util.clone({}, this.opt, opt);
        // Build work items.
        this.layer = factory.polyline([], this.opt.line);
        this.hintLine = factory.polyline([], this.opt.hint);
        this.hintMarker = this.createHintMarker();
        // Assemble work layer and render on map.
        this.layerGroup = factory.layerGroup()
            .addLayer(this.layer)
            .addLayer(this.hint)
            .addLayer(this.hintMarker)
            .addTo(Map);

        // Define behavior.
        Map.on().getContainer().style.cursor = 'crosshair';

        
    },

    disable () {

    }
});
