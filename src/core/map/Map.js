import { factory } from '..';
import { MAP_CONTAINER, MAP_CONFIG } from '../../config';

const el = document.createElement('div');
el.id = 'map';
el.style.height = '99vh';
el.style.border = '4px inset';

/**
 * The map instance of the application.
 * 
 * @namespace Map
 */
export const Map = factory.map(el, MAP_CONFIG);

Map.render = function render () {
    let container = document.getElementById(MAP_CONTAINER);
    container.appendChild(el);
    
    return this.invalidateSize();
};

Map.setCursor = function (type) {
    this.getContainer().style.cursor = type;
    
    return this;
};