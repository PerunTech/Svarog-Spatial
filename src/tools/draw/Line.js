import { factory, Map } from "../../core";

export function drawLine (opt = {}) {
    const _opt = {
        line: {},
        hintLine: {},
        hintMarker: { icon: factory.divIcon({ className: 'marker-icon cursor-marker' })},
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point(0, 10),
            direction: 'bottom',
            opacity: 0.8
        },
        ...opt
    };

    // Build work items. Assemble work layer and render on map.
    const layer = factory.polyline([], _opt.line),
        hintLine = factory.polyline([], _opt.hint),
        hintMarker = factory.marker(Map.getCenter(), _opt.hintMarker)
            .bindTooltip(_opt.tooltip)
            .openTooltip()
            .addTo(Map),
        layerGroup = factory.layerGroup().addLayers([layer, hintLine, hintMarker]); // .addTo(Map);

    return {
        enable () {
            // Define behavior.
            Map.on().getContainer().style.cursor = 'crosshair';
        },
        
        disable () {
            console.log(layer + hintLine + hintMarker + layerGroup);
        }
    };
}