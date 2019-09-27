import { Util } from './Util';

/**
 * API templater.
 * Defines behavioral properties implemented by all interfaces.
 * 
 * &nbsp;
 * 
 * @abstract
 * @class Interface
 */
export function Interface () { Util.isAbstract.call(this, Interface); }

/**
 * Defines an API.
 * 
 * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
 * Applies only to the immediate properties of object `i` and their future modification. 
 * If the value of those properties are objects themselves, those objects are not frozen
 * and may be the target of property addition, removal or value re-assignment operations.
 * 
 * &nbsp;
 * 
 * @function define (o: any, i: any): Readonly<API>
 * 
 * @param {*} o - The implementation object.
 * @param {*} i - The interface. 
 * 
 * @returns Readonly<API>;
 */
Interface.define = function (o, i) {
    /**
     * If we want to do something on intialization for all interfaces, we do it here.
     * Ensures that a single instance is created only. 
     * Ensures that inherited properties of our interface are forgotten. 
     * 
     * @constructs API
     */
    let API = function () {
        // Apparently, you can contruct new objects out of object<API>.prototype.constructor.
        // Thus, you can create an API here, then access the above path in the created object,
        // in order to crete a new copied API out of that.
        // Do not allow this. We shall do this only once.
        if ( !(this instanceof API) ) { throw new Error('Do not instantiate self.'); }
        
        // Shallow-copy our interface to the API construct.  
        Util.assign(this, i);

    }
    // Do not inherit prototype of the interface we define.
    // If someone accidentally made the interface inherit other classes, start anew, with a clean slate.
    // API.prototype = Object.getPrototypeOf(i);

    /**
     * Access a property of the implementation object(module) that is interfaced with,
     * specified by `path`.
     * 
     * &nbsp;
     * 
     * @function get (path?: String): Object
     * 
     * @param {String} [path] Accessor path, represented as string.
     * 
     * @returns (implementation_object.path || undefined) || implementation_object root;
     */
    API.prototype.get = function (path = null) {
        return path ? Util.get(path, o) : o;
    }

    /**
     * Execute function of the implementation object(module) that is interfaced with,
     * specified by `path` with the provided arguments `args` in the provided `context`.
     * 
     * &nbsp;
     *
     * @function call (path: String, context?: Object, args?: List): Object
     * 
     * @param {String} path - Accessor path, represented as string.
     * @param {Object} [context] - Context of the function call. The `this` object on invocation.
     * @param {Array} [args] - Arguments to be passed to the called function.
     * 
     * @returns Fn.call(context, args) || null;
     */
    API.prototype.call = function (path, context = this, args = []) {
        let fn = this.fetch(path)

        return typeof fn === 'function'
            ? fn.apply(context, args)
            : null;
    }

    return Object.freeze(new API());
}