/**
 * Global utility functions
 * 
 * @namespace Util
 */
export const Util = {
    /**
     * Copy the values of all of the enumerable own properties from one or more source objects to a target object.
     * Returns the target object.
     * 
     * Compatibility polyfill for `Object.assign`.
     * 
     * &nbsp;
     * 
     * @function assign (target: Object, ...src: Object): target & ...src
     * 
     * @param {Object} target - The taget object to copy to.
     * @param  {...Object} src - The source object(s) to copy from.
     * 
     * @returns target & ...src;
     */
    assign: Object.assign || (function () {
        return function (target) {
            for (let i = 1; i < arguments.length; i+=1) {
                let src = arguments[i]
                Object.keys(src).map(k => { target[k] = src[k]; })
            }

            return target;
        }
    })(),

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
    bind(fn, obj) {
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
     * Compatibility polyfill for `Object.create`
     * 
     * &nbsp;
     * 
     * @function create (proto: Object, properties?: Object): Object
     * 
     * @param {Object} proto - The object which should be the prototype of the newly-created object.
     * @param {Object} properties - An object whose enumerable own properties specify property descriptors
     *        to be added to the newly-created object.
     *
     * @return A new object with the specified prototype object and properties;
     */
    create: Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),

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
     * Merges the properties of the `src` object (or multiple objects)
     * into `dest` object and returns the latter. Includes `prototype`.
     * 
     * &nbsp;
     * 
     * @function extend (dest: Object, src?: ...Object): Object
     *
     * @param {Object} dest - Destination object of the merge.
     * @param {...Object} [src] - Source object(s) to be merged.
     *
     * @return dest;
     */
    extend(dest) {
        let i, j, len, src;

        for (j = 1, len = arguments.length; j < len; j++) {
            src = arguments[j];
            for (i in src) {
                dest[i] = src[i];
            }
        }

        return dest;
    },

    /**
     * `Round` polyfill.
     * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
     * 
     * &nbsp;
     * 
     * @function formatNum (num: number, digits?: number): number
     *
     * @param {number} num - Number to be rounded.
     * @param {number} [digits] - Specifies how many places to round for.
     *
     * @return rounded number;
     */
    formatNum(num, digits) {
        digits = (digits === undefined ? 6 : digits);
        
        return +(Math.round(num + ('e+' + digits)) + ('e-' + digits));
    },

    /**
     * Access `obj` by string `path`.
     *
     * Supports nested structures.
     * Supports dot and bracket notation.
     * Removes string blank spaces.
     * 
     * &nbsp;
     * 
     * @function get (path: string, obj: Object): obj.path || undefined
     *
     * @param {string} path - Accessor path, represented as string.
     * @param {Object} obj - Object to access.
     *
     * @returns obj.path || undefined;
     */
    get(path, obj) {
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
     * Rather silly formulation to write hasProp question and then specify object and prop.
     * May append this to Core entity so we can write obj.hasProp(prop).
     * `#revise_me`
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
    hasProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },

    /**
     * Abstract class check. Prevents instances of abstract classes. 
     * 
     * &nbsp;
     * 
     * @function isAbstract (Class: Function): Error || void
     * 
     * @param {Function} Class - A constructor function. 
     * 
     * @returns Error || void;
     */
    isAbstract(Class) {
        if (this instanceof Class) {
            throw new Error(Class.name + ' is an abstract class and can not be instantiated.');
        } 
    },

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
    isArray: Array.isArray || function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    },

    /**
     * Merges the given `options` properties to the .options of `obj`,
     * returning the resulting `obj.options`.
     * 
     * &nbsp;
     * 
     * @function setOptions (obj: Object, options: Object): Object
     *
     * @param {Object} obj - Object whose options property is the target of the merge.
     * @param {Object} options - Options object whose own properties are to be merged in the target. 
     *
     * @return obj.options;
     */
    setOptions(obj, options) {
        if (!this.hasProp(obj, 'options')) {
            obj.options = obj.options ? this.create(obj.options) : {}; 
        }
        for (let i in options) {
            obj.options[i] = options[i];
        }

        return obj.options;
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
    throttle(fn, time, context) {
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
     * Returns the number `x` modulo `range` in such a way so it lies within `range[0]` and `range[1]`.
     * The returned value will be always smaller than `range[1]` unless `includeMax` is set to `true`.
     * 
     * &nbsp;
     * 
     * @function wrapNum (x: number, range: Number[], includeMax?: boolean): number
     *
     * @param {number} x - Number whose modulo range is to be calculated.
     * @param {Number[]} range - Range value for the calculation.
     * @param {boolean} [includeMax] - Flag, should we include maxRange = 1 as a valid result.
     *
     * @retun x modulo;
     */
    wrapNum(x, range, includeMax) {
        let max = range[1],
            min = range[0],
            d = max - min;

        return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
    },
}