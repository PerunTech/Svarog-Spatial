/**
 * Global utility functions.
 * 
 * &nbsp;
 * 
 * @namespace util
 */
export const util = {
    /**
     * `Bread and butter segment.`
     * `Object composition, prototypal inheritance.`
     */

    create (properties, prototype) {
        return Object.setPrototypeOf(properties, prototype);
    },

    /**
     * Object delegation, differential inheritance.
     * 
     * Base JavaScript inheritance. Creates an object that has the specified prototype,
     * and that optionally contains specified properties.
     * 
     * Can create objects 'ex nihilo' (out of nothing) by calling create(null).
     * The result is an object whose prototype points to null (end of chain).
     * 
     * Inherit from a single source (the argument) via delegation, the argument `proto`
     * becomes the prototype (a link to the source) of the newly created object. 
     * Methods and properties which are not found on the resulting object are delegated to 
     * the prototype, up the chain, until the accessed path is found or null is reached.
     * 
     * Changes to the source `proto` are reflected in all objects that inherit from it,
     * such as the result object of this function. Expresses is-a relationship. 
     * 
     * Compatibility polyfill for `Object.create`.
     * 
     * &nbsp;
     * 
     * @function inherit (proto: Object, properties?: Object): Object
     * 
     * @param {Object} proto - The object which should be the prototype of the newly-created object.
     * @param {Object} [properties] - An object whose enumerable own properties specify property descriptors
     *        to be added to the newly-created object.
     *
     * @return A new object with the specified prototype object and properties;
     */
    inherit (proto, properties) {
        return Object.create(proto, properties) || (function () {
            function F() {}
            return function (proto) {
                F.prototype = proto;
                return new F();
            };
        })();
    },

    /**
     * Object cloning, concatenative inheritance.
     * 
     * Provides inheritance from multiple prototypes. Copies the values of all
     * of the enumerable own properties from one or more source objects to a target object.
     * Returns the target object. Excludes `prototype` of the source(s).
     * 
     * Changes to source(s) are not propagated to targets (clones), as properties are simply copied.
     * Expresses has-a reationship. 
     * 
     * Compatibility polyfill for `Object.assign`.
     * 
     * &nbsp;
     * 
     * @function clone (target: Object, ...src: Object): target & ...src
     * 
     * @param {Object} target - The taget object to copy to.
     * @param  {...Object} src - The source object(s) to copy from.
     * 
     * @returns target & ...src;
     */
    clone (target, ...src) {
        return Object.assign(target, ...src) || (function () {
            return function (target) {
                // Cast target into Object if it is not.
                // Reference is retained, no new objects are created, target is returned (augmented below).
                let result = Object(target); 

                for (let i = 1; i < arguments.length; i++) {
                    let src = arguments[i]
                    if (src !== null && src !== undefined) 
                        for (let key in src) {
                            if (Object.prototype.hasOwnProperty.call(src, key)){
                                result[key] = src[key];
                            }
                        }
                }

                return result;
            }
        })();
    },

    /**
     * Concatenation of a full prototype chain, i.e aggregation.
     * 
     * Merges the properties of the `src` object (or multiple objects)
     * into `target` object and returns the latter. Includes `prototype` of all `src` objects.
     * 
     * Flattens `src(s)` unto `target` instance.
     * 
     * Aggre
     * 
     * &nbsp;
     * 
     * @function cloneDeep (target: Object, src?: ...Object): target
     *
     * @param {Object} target - Destination object of the merge.
     * @param {...Object} [src] - Source object(s) to be merged.
     *
     * @return target;
     */
    cloneDeep (target) {
        let result = Object(target);

        for (let i = 1; i < arguments.length; i++) {
            let src = arguments[i]
            if (src !== null && src !== undefined) 
                for (let key in src) {
                    result[key] = src[key];
                }
        }

        return target;
    },

    /**
     * `Object utilities.`
     */

    /**
     * Access `obj` by string `path`.
     *
     * Supports nested structures.
     * Supports dot and bracket notation.
     * Removes string blank spaces.
     * 
     * &nbsp;
     * 
     * @function access (path: string, obj: Object): obj.path || undefined
     *
     * @param {Object} obj - Object to access.
     * @param {string} path - Accessor path, represented as string.
     *
     * @returns obj.path || undefined;
     */
    access (obj, path) {
        return path
            .replace(/\[([^\]]+)]/g, '.$1') // support dot(.) and bracket([]) accessors
            .split('.') // init array on accessing elements
            .filter(s => s) // remove blanks
            .reduce((k, v) => k && k[v], obj);  // support nested, null check on accessing keys
    },

    /**
     * Checks if `obj` has own property `prop`.
     * 
     * Solves rule:
     *      Do not access Object.prototype method 'hasOwnProperty' from target object.
     *  
     * &nbsp;
     *  
     * @function hasProp (obj: Object, prop: string | number | symbol): boolean
     * 
     * @param {Object} obj - Object to be checked.
     * @param {string | number | symbol} prop - Property to be found on obj.
     * 
     * @returns boolean;
     */
    hasProp (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },

    /**
     * `Function utilities.`
     */

    /**
     * Returns a new function bound to the arguments passed, like `Function.prototype.bind`.
     * 
     * &nbsp;
     * 
     * @function bind (fn: Function, …): Function
     *
     * @param {Function} fn - Function to be binded.
     * @param {Object} obj - Binding context (i.e. this) of the function. 
     *
     * @return Fn;
     */
    bind (fn, obj) {
        let slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        let args = slice.call(arguments, 2);

        return function () {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    },

    /**
     *  Returns a function, that, as long as it continues to be invoked, will not be triggered `<Fn>`.
     *  The function will be called after it stops being called for N milliseconds `<time>`.
     *  If `exec` is passed, trigger the function on the leading edge, instead of the trailing.
     * 
     * &nbsp;
     * 
     * @function debounce (Fn: Function, time: number, exec: boolean): Function
     *
     * @param {Function} Fn - Function to be debounced.
     * @param {number} time - Time interval of the debounce, in milliseconds.
     * @param {boolean} [exec=false] - Trigger flag, leading / trailing edge.
     *
     * @returns Function executed with a delay between repeated calls (think dom events and api/ws calls);
     */
    debounce (Fn, time, exec = false) {
        // timer
        let deltaT
        return function () {
          // context to be passed to execFn
            const context = this
            const args = arguments

          // Function to be executed when the timer ends (trailing-end)
            const execFn = function () {
                deltaT = null
                !exec && Fn.apply(context, args)
            }
          // reset timer for every root call, restart the debounce waiting period.
            clearTimeout(deltaT)
            deltaT = setTimeout(execFn, time);

          // Call immediately if you're dong a leading-end execution
            (exec && !deltaT) && Fn.apply(context, args)
        }
    },

    /**
     * Returns a function which executes function `fn` with the given scope `context`,
     * so that the `this` keyword refers to `context` inside `fn`'s code.
     *
     * The function `fn` will be called no more than one time per given amount of `time`.
     *
     * The arguments received by the bound function will be any arguments passed when binding the function,
     * followed by any arguments passed when invoking the bound function.
     * 
     * &nbsp;
     * 
     * @function throttle (fn: Function, time: number, context: Object): Function
     *
     * @param {Function} fn - Function to be throttled.
     * @param {number} time - Time interval for the throttle, in milliseconds.
     * @param {Object} context - Context that is binded to the function when the call is executed.
     * 
     * @returns Function executed only once per the given time interval;
     */
    throttle (fn, time, context) {
        let lock, args, wrapperFn, later;

        later = function () {
            // reset lock and call if queued
            lock = false;
            if (args) {
                wrapperFn.apply(context, args);
                args = false;
            }
        };

        wrapperFn = function () {
            if (lock) {
                // called too soon, queue to call later
                args = arguments;

            } else {
                // call and lock until later
                fn.apply(context, arguments);
                setTimeout(later, time);
                lock = true;
            }
        };

        return wrapperFn;
    },

    /**
     * `Array utilities.`
     */

    /**
     * Compatibility polyfill for [Array.isArray]
     * 
     * &nbsp;
     * 
     * @function isArray (Object): boolean
     * 
     * @param {Object} obj - The object to be checked.
     *
     * @returns boolean;
     */
    isArray (obj) {
        return  Array.isArray(obj) || function (obj) {
            return (Object.prototype.toString.call(obj) === '[object Array]');
        }
    },

    /**
     * Flattens a nested array of any arbitrary levels to a composed, single-level array. 
     * 
     * &nbsp;
     * 
     * @function flattenDeep (arr: any[]): []
     * 
     * @param {Array} arr - The array to be flattened.
     * 
     * @returns [];
     */
    flattenDeep (arr) {
        return arr
            .filter(x => ![null, '', undefined].includes(x))
            .reduce((acc, val) =>  acc.concat(this.isArray(val) ? this.flattenDeep(val) : val), []);
    },

    /**
     * Creates a flat array of elements coerced to the given `type`.
     * 
     * The input `obj` can be any javascript primitive or an arbitrarily nested object / array,
     * for which its values (and keys) can be converted into the specified type. 
     * 
     * All values will be trimmed for all whitespaces and separated into separate elements
     * for any colon, semicolon or escape slash.
     * 
     * &nbsp;
     * 
     * @function normalize (obj: any type?: PrimitiveConstructor): [type, type, ...type]
     * 
     * @param {*} obj - Any JavaScript object.
     * @param {Object} [type] - A JavaScript primitive constructor type, i.e Number/String (capital).
     * 
     * @returns [type, type, ...type]
     */
    normalize (obj, type = String) {
        return obj.toString().replace(/\s+/g, '').split(/[;,/]/).map(type);
    },
};