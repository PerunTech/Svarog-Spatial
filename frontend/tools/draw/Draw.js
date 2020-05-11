import { drawMarker, drawCircleMarker, drawLine, drawPolygon, drawRectangle, drawCircle, drawCut, snap } from '..';

/**
 * Drawing tools.
 * 
 * &nbsp;
 * 
 * @namespace draw
 */
export const draw = {
    marker: (opt = {}) =>
        drawMarker.enable(opt),

    line: (opt = {}) => 
        drawLine.enable(opt),

    polygon: (opt = {}) => 
        drawPolygon.enable(opt),

    rectangle: (opt = {}) => 
        drawRectangle.enable(opt),

    circle: (opt = {}) => 
        drawCircle.enable(opt),

    circleMarker: (opt = {}) => 
        drawCircleMarker.enable(opt),

    cut: (opt = {}) => 
        drawCut.enable(opt),
}