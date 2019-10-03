import { Interface } from "../core/Interface";

/**
 * @interface iCRS
 */
export const iCRS = Interface.define({
    // instance fields
    code: 'String',
    def: 'String',
    projection: 'Class',
    transformation: 'Object',
    _scales: 'Array',
    // prototype
    R: 'Number',
    infinite: 'Boolean',
    project: 'Function',
    unproject: 'Function',
    distance: 'Function',
    getCode: 'Function',
    scale: 'Function',
    zoom: 'Function'
})