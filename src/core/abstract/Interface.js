import { util } from '..';

/**
 * A contract of behavior between a class entity and its environment.
 * 
 * &nbsp;
 * 
 * @abstract
 * @class Interface
 */
export function Interface () {}

/**
 * Defines an Interface.
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
     * @constructs Interface
     */
    let Interface = function () {
        if ( !(this instanceof Interface) ) {
            throw new Error('Cannot instantiate self. Interfaces are final');
        }
        // Shallow-copy our interface definitions to the Interface construct. 
        util.assign(this, i);
    }

    /**
     * namespace so the above function knows its a constructor.
     * `#revise_me`, rubbish, do something useful, and change name signature
     */
    Interface.prototype.get = function () {
        return this;
    }

    // Prohibit modification to our interface object.
    return Object.freeze(new Interface());
};

/**
 * <Notes>
 * 
 * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
 * Applies only to the immediate properties of interface  `i` and their future modification. 
 * If the value of those properties are objects themselves, those objects are not frozen
 * and may be the target of property addition, removal or value re-assignment operations.
 * 
 * If we want to do something on intialization for all interfaces, we do it here.
 * Ensures that a single instance is created only. 
 * Ensures that inherited properties of our interface are forgotten.
 * 
 * Apparently, you can contruct new objects out of object<Interface>.prototype.constructor.
 * Thus, you can create an Interface here, then access the above path in the created object,
 * in order to crete a new copied Interface out of that.Do not allow this. We shall do this only once.
 */