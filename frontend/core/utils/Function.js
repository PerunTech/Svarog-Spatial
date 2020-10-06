/**
 * Function utilities. 
 * 
 * Function.prototype is preserved, these functions enclose rather than modify
 * the Function object. Keep it that way.
 * 
 * &nbsp;
 * 
 * @namespace util.fn
 */
export const fn = {
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
     * Allows callers to hook into the call stack (specified by `fn`)
     * and execute a function (specified by `hook`), before / after
     * the execution of `fn`. 
     * 
     * Order of execution is toggled by `hookAfter`, default implementation is before.  
     * 
     * &nbsp;
     * 
     * @function override (fn: Function, hook: Function, hookAfter: boolean): any
     * 
     * @param {Function} fn - The function to be overriden.
     * @param {Function} hook - The hook to be executed.
     * @param {boolean} hookAfter - Toggle for execution interval.
     * 
     * @returns hook(), fn();
     */
    override (fn, hook, hookAfter) {
        if (!hookAfter) {
            return function () {
                let protoVal = fn.apply(this, arguments);
                let args = Array.prototype.slice.call(arguments);
                args.push(protoVal);
                return hook.apply(this, args);
            }
        } else {
            return function () {
                hook.apply(this, arguments);
                return fn.apply(this, arguments);
            }
        }
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
     * Creates a function that is an aggregate of the supplied argument functions,
     * chained in the order they were provided. Alternative for the comma operator
     * used between function calls, which may look unorthdox to some sets of eyes.
     *
     * Will only create a new function if needed,
     * otherwise will pass back existing functions or null.
     *
     * @function chain(...fns: Function[]): Function
     * 
     * @param {...Function} fns - Functions to be chained.
     * 
     * @returns function || null;
     */
    chain(...fns) {
        return fns
            .filter(fn => fn != null && typeof fn === 'function')
            .reduce((acc, fn) => {
                return acc === null
                    ? fn
                    : (...args) => { acc.apply(this, args), fn.apply(this, args); }; 
            }, null);
    }
};