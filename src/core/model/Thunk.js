/**
 * Extends Redux store as middleware. 
 * 
 * Provides support for side effects, conditional logic
 * and plain old asynchronous effects in action creators.
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

        return next(action);
    };
})();

/**
 * <Notes> 
 * 
 * If we need access to our custom made api available in all action creators - "thunks",
 * pass third parameter on line 15 => { return action(dispatch, getState, api); }.
 */