import { factory } from '../index';

const el = document.createElement('div');
el.id = 'map';
el.style.height = '99vh';
el.style.border = '4px inset';

/**
 * The map instance of the application.
 * 
 * @namespace Map
 */
export const Map = factory.map(el, {
    center: [41.3108238809182, 11.49169921875], // Tyrrhenian Sea
    zoom: 8,
    minZoom: 0,
    maxZoom: 18,
    dragging: true,
    zoomControl: false,
    doubleClickZoom: false,
    scrollWheelZoom: true,
    zoomAnimation: true,
    attributionControl: false,
    preferCanvas: false,
    keyboard: true,
    keyboardPanDelta: 80,
    tap: false,
    tapTolerance: 15,
});

Map.render = function () {
    let container = document.getElementById('mapContainer');
    container.appendChild(el);
    
    this.invalidateSize();
};

Map.setCursor = function (type) {
    this.getContainer().style.cursor = type;
    
    return this;
};