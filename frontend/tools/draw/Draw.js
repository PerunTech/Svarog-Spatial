import { snap } from '..';
/* shapes */
import { marker } from './Marker';
import { circleMarker } from './CircleMarker';
import { line } from './Line';
import { polygon } from './Polygon';
import { rectangle } from './Rectangle';
import { circle } from './Circle';
import { cut } from './Cut';

/**
 * Drawing tools.
 * 
 * &nbsp;
 * 
 * @namespace draw
 */
export const draw = {
    marker,
    circleMarker,
    line,
    polygon,
    rectangle,
    circle,
    cut
}

draw.prototype = {
    ...snap
}