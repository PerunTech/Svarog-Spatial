import { factory, Map } from '../../core';
import { snap } from '..';

export const Draw = factory.Class.extend({
    includes: [snap],
    options: {
        snappable: true,
        snapDistance: 20,
        tooltips: true,
        cursorMarker: true,
        finishOnDoubleClick: false,
        finishOn: null,
        allowSelfIntersection: true,
        templineStyle: {},
        hintlineStyle: {
            color: '#3388ff',
            dashArray: '5,5',
        },
        markerStyle: {
            draggable: true,
        },
    },

    setOptions(options) {
        factory.Util.setOptions(this, options);
    },

    initialize() {
      // save the map
        this._map = Map;
        
        // define all possible shapes that can be drawn
        this.shapes = ['Marker', 'CircleMarker', 'Line', 'Polygon', 'Rectangle', 'Circle', 'Cut'];
        
        // initiate drawing class for our shapes
        // this['Marker'] = new DrawMarker(this._map);
    },

    setPathOptions(options) {
        this.options.pathOptions = options;
    },

    getShapes() {
        // if somebody wants to know what shapes are available
        return this.shapes;
    },

    enable(shape, options) {
        if (!shape) {
            throw new Error(`Error: Please pass a shape as a parameter.
                Possible shapes are: ${this.getShapes().join(',')}`);
        }

        // disable drawing for all shapes
        this.disable();

        // enable draw for a shape
        this[shape].enable(options);
    },

    disable() {
      // there can only be one drawing mode active at a time on a map
      // so it doesn't matter which one should be disabled.
      // just disable all of them
        this.shapes.forEach(shape => {
            this[shape].disable();
        });
    },
});