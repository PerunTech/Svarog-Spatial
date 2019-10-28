import { util } from "../Util";

/**
 * Extends Redux store abilities, as middleware between all actions and reducers. 
 * 
 * Provides support for side effects, conditional logic 
 * and plain old asynchronous effects in action creators.
 * 
 * Provides support for simple actions consisting of plain key / value
 * pairs which are transformed into { type: key, value: value }. 
 * 
 * Supports multiple actions in a single call via an object literal
 * with the form { key: value, key: value ...obj }.
 * 
 * &nbsp;
 * 
 * @constant
 * @type {Function} 
 */
export const thunk = (function () {
    return ({ dispatch, getState }) => next => action => {
        if (typeof action === 'function') {
            return action(dispatch, getState);
        }
        if (typeof action === 'object' && !util.hasProp(action, 'type')) {
            return Object.keys(action).map(key => {
                return next({ type: key, value: action[key] });
            })
        }

        return next(action);
    };
})()

/**
 * <Notes> 
 * 
 * If we need access to our custom made api available in all action creators - "thunks",
 * pass third parameter on line 24 => { return action(dispatch, getState, api); }.
 */