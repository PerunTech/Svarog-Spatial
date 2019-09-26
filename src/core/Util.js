/**
 * Global utility functions
 * 
 * @namespace Util
 */
export const Util = {
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
     * Access `obj` by string `path`.
     *
     * Supports nested structures.
     * Supports dot and bracket notation.
     * Removes string blank spaces.
     * 
     * &nbsp;
     * 
     * @function get (path: String, obj: Object): Object || undefined
     *
     * @param {String} path - Accessor path, represented as string.
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
     * Merges the properties of the `src` object (or multiple objects)
     * into `dest` object and returns the latter.
     * 
     * &nbsp;
     * 
     * @function extend (dest: Object, src?: Object): Object
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
     * @param {String | Number | Symbol} prop - Property to be found on obj.
     *
     * @returns boolean;
     */
    hasProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },

    /**
     *  Returns a function, that, as long as it continues to be invoked, will not be triggered `<Fn>`.
     *  The function will be called after it stops being called for N milliseconds `<time>`.
     *  If `exec` is passed, trigger the function on the leading edge, instead of the trailing.
     * 
     * &nbsp;
     * 
     * @function debounce (Fn: Function, time: Number, exec: Boolean): Function
     *
     * @param {Function} Fn - Function to be debounced.
     * @param {Number} time - Time interval of the debounce, in milliseconds.
     * @param {Boolean} exec - Trigger flag, leading / trailing edge.
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
     * @function throttle (fn: Function, time: Number, context: Object): Function
     *
     * @param {*} fn - Function to be throttled.
     * @param {*} time - Time interval for the throttle, in milliseconds.
     * @param {*} context - Context that is binded to the function when the call is executed.
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
     * @function wrapNum (x: Number, range: Number[], includeMax?: Boolean): Number
     *
     * @param {Number} x - Number whose modulo range is to be calculated.
     * @param {Number} range - Range value for the calculation.
     * @param {Boolean} includeMax - Flag, should we include maxRange = 1 as a valid result.
     *
     * @retun x modulo;
     */
    wrapNum(x, range, includeMax) {
        let max = range[1],
            min = range[0],
            d = max - min;

        return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
    },

    /**
     * `Round` polyfill.
     * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
     * 
     * &nbsp;
     * 
     * @function formatNum (num: Number, digits?: Number): Number
     *
     * @param {Number} num - Number to be rounded.
     * @param {Number} digits - Specifies how many places to round for.
     *
     * @return rounded Number;
     */
    formatNum(num, digits) {
        digits = (digits === undefined ? 6 : digits);
        
        return +(Math.round(num + ('e+' + digits)) + ('e-' + digits));
    },

    /**
     * Compatibility polyfill for [Array.isArray]
     * 
     * &nbsp;
     * 
     * @function isArray (obj): Boolean
     * 
     * @param {Object} obj - The object to be checked.
     *
     * @returns Boolean;
     */
    isArray: Array.isArray || function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    }
}