/**
 * @namespace Util
 */
export const Util = {
    /**
     * @function extend
     * (dest: Object, src?: Object): Object
     *
     * Merges the properties of the `src` object (or multiple objects) into `dest` object and
     * returns the latter.
     *
     * @param {Object} dest
     *
     * @return dest
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
     * @property create
     * (proto: Object, properties?: Object): Object
     *
     * Compatibility polyfill for `Object.create`
     *
     * @return new Object
     */
    create: Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),

    /**
     * @function bind
     * (fn: Function, …): Function
     *
     * Returns a new function bound to the arguments passed, like `Function.prototype.bind`
     *
     * @param {Function} fn
     * @param {Object} obj
     *
     * @return fn
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
     * @function debounce
     * (Fn: Function, time: Number, exec: Boolean): Function
     *
     *  Returns a function, that, as long as it continues to be invoked, will not be triggered `<Fn>`.
     *  The function will be called after it stops being called for N milliseconds `<time>`.
     *  If `exec` is passed, trigger the function on the leading edge, instead of the trailing.
     *
     * @param {Function} Fn
     * @param {Number} time
     * @param {Boolean} exec
     *
     * @return Function executed with a delay between repeated calls (think dom events and api/ws calls)
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
     * @function throttle
     * (fn: Function, time: Number, context: Object): Function
     *
     * Returns a function which executes function `fn` with the given scope `context`,
     * so that the `this` keyword refers to `context` inside `fn`'s code.
     *
     * The function `fn` will be called no more than one time per given amount of `time`.
     *
     * The arguments received by the bound function will be any arguments passed when binding the function,
     * followed by any arguments passed when invoking the bound function.
     *
     * @param {*} fn
     * @param {*} time
     * @param {*} context
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
     * @function wrapNum
     * (x: Number, range: Number[], includeMax?: Boolean): Number
     *
     * Returns the number `x` modulo `range` in such a way so it lies within `range[0]` and `range[1]`.
     * The returned value will be always smaller than `range[1]` unless `includeMax` is set to `true`.
     *
     * @param {Number} x
     * @param {Number} range
     * @param {Boolean} includeMax
     *
     * @retun n modulo
     */
    wrapNum(x, range, includeMax) {
        let max = range[1],
            min = range[0],
            d = max - min;
        return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
    },

    /**
     * @function formatNum
     * (num: Number, digits?: Number): Number
     *
     * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
     *
     * @param {Number} num
     * @param {Number} digits
     *
     * @return round n
     */
    formatNum(num, digits) {
        digits = (digits === undefined ? 6 : digits);
        return +(Math.round(num + ('e+' + digits)) + ('e-' + digits));
    }
}