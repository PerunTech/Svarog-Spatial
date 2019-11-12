import { factory, Map } from "../../core";

export function drawLine (opt = {}) {
    const _opt = {
        line: {},
        hintLine: { color: 'blue', dashArray: [5, 5]},
        hintMarker: { icon: factory.divIcon({ className: 'marker-icon cursor-marker' })},
        tooltip: {
            className: 'draw-marker-hint',
            permanent: true,
            offset: factory.point([0, 10]),
            direction: 'bottom',
            opacity: 0.8
        },
        ...opt
    };

    // Build work items. Assemble work layer and render on map.
    const layerGroup = factory.layerGroup().addTo(Map),
        layer = factory.polyline([], _opt.line).addTo(layerGroup),
        hintLine = factory.polyline([], _opt.hintLine).addTo(layerGroup),
        hintMarker = factory.marker([0,0], _opt.hintMarker)
            .bindTooltip('add vertex', _opt.tooltip)
            .openTooltip()
            .addTo(layerGroup);

    function enable () {
        return Map.on({click: createVertex, mousemove: syncHint})
            .fire('drawStart', { layer: layer })
            .setCursor('crosshair');
    }

    function disable () {
        return Map.fire('drawEnd', { layer: layer })
            .removeLayer(layerGroup)
            .off({click: createVertex, mousemove: syncHint})
            .setCursor('');
    }

    function finishShape () {
        return (layer.getLatLngs().length > 1) 
            && (disable() && Map.fire('create', { layer: layer }).addLayer(layer))
    }

    function createVertex ({latlng}) {
        return Map.fire('vertexAdd', {
            layer: layer.addLatLng(latlng),
            vertex: factory.marker(latlng, { 
                draggable: false,
                icon: factory.divIcon({className: 'marker-icon'})
            }).on({click: finishShape }).addTo(layerGroup)
        });
    }

    function removeLastVertex () {
        const coords = layer.getLatLngs(),
            lastVx = coords.pop();

        return (layer.getLatLngs().length > 0)
            ? (layerGroup.removeLayer(layerGroup.getLayers()
                .filter(l => l instanceof factory.Marker)
                .filter(l => !factory.DomUtil.hasClass(l._icon, 'cursor-marker'))
                .find(l => l.getLatLng() === lastVx))
                && layer.setLatLngs(layer.getLatLngs())
                && syncHint)
            : disable();
    }

    function syncHint ({latlng}) {
        hintMarker.setLatLng(latlng);

        const [lastPoint] = layer.getLatLngs().slice(-1);
        lastPoint && hintLine.setLatLngs([lastPoint, latlng]);
    }

    return {
        enable: enable,
        disable: disable,
        finishShape: finishShape,
        undo: removeLastVertex
    };
}