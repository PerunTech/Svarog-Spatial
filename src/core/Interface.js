import { Util } from './Util';

/**
 * A contract of behavior between a class entity and its environment.
 * 
 * &nbsp;
 * 
 * @abstract
 * @class Interface
 */
export function Interface () { Util.isAbstract.call(this, Interface); }

/**
 * Defines an Interface.
 * 
 * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
 * Applies only to the immediate properties of interface  `i` and their future modification. 
 * If the value of those properties are objects themselves, those objects are not frozen
 * and may be the target of property addition, removal or value re-assignment operations.
 * 
 * &nbsp;
 * 
 * @function define (i: Object): Readonly<Interface>
 * 
 * @param {Object} i - The interface object literal. 
 * 
 * @returns Readonly<Interface>;
 */
Interface.define = function (i) {
    /**
     * If we want to do something on intialization for all interfaces, we do it here.
     * Ensures that a single instance is created only. 
     * Ensures that inherited properties of our interface are forgotten. 
     * 
     * @constructs Interface
     */
    let Interface = function () {
        // Apparently, you can contruct new objects out of object<Interface>.prototype.constructor.
        // Thus, you can create an Interface here, then access the above path in the created object,
        // in order to crete a new copied Interface out of that.
        // Do not allow this. We shall do this only once.
        if ( !(this instanceof Interface) ) { throw new Error('Cannot instantiate self. Interfaces are final'); }
        
        // Shallow-copy our interface to the Interface construct.  
        Util.assign(this, i);
    }

    /**
     * `#revise_me`, rubbish, do something useful, and change name signature
     */
    Interface.prototype.get = function () {
        return this;
    }

    return Object.freeze(new Interface());
}