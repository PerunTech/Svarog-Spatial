import { Interface } from '../core/Interface';

/**
 * @interface iFactory
 */
export const iFactory = Interface.define({
    // crs (code: string, def: string, opt?: Object): CRS
    crs: 'Function',

    // latLng(latitude: number, longitude: number, altitude?: number): LatLng
    latLng: 'Function',

    // point(x: number, y: number, round?: boolean): Point
    point: 'Function',

    // projection(code: string, def: string, bounds: Object): Projection
    projection: 'Function',

    // transformation(a: number, b: number, c: number, d: number): Transformation
    transformation: 'Function',
})