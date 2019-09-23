/**
 * Defines behavioral properties implemented by all interfaces.
 * 
 * @abstract
 * @class Interface
 */
export function Interface () {}

/**
 * Defines an interface.
 * 
 * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
 * Applies only to the immediate properties of object `i` and their future modification. If the value
 * of those properties are objects themselves, those objects are not frozen and may be the target of property addition,
 * removal or value re-assignment operations.
 * 
 * `To do`: may implement duck-typing checks. 
 * 
 * &nbsp;
 * 
 * @function define (i: any): i <shallow-immutable>
 * 
 * @param {*} i - The interface object to be defined, preferrably described as object literal. 
 * 
 * @returns i <shallow-immutable>;
 */
Interface.define = function (i) {
    return Object.freeze(i);
}