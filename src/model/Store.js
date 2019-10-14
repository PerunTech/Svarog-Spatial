import { createStore, combineReducers } from 'redux';

/**
 * Redux store instance.
 */
export const store = (function () {
    /**
     * Internal composite of all registered reducers of the module.
     * 
     * @private
     * @namespace _reducers
     */
    const _reducers = {};

    /**
     * Creates root reducer function.
     * 
     * &nbsp;
     * 
     * @private
     * @function _createRootReducer (): Function
     * 
     * @returns Reducer function;
     */
    function _createRootReducer () {
        return combineReducers({ ..._reducers });
    } 

    /**
     * The whole state tree of the application.
     * 
     * @constant appState
     */
    const appState = createStore(_createRootReducer());

    /**
     * Adds the reducer to application state.
     * 
     * &nbsp;
     * 
     * @function addReducer (key: string, reducer: Function): void
     * 
     * @param {string} key - The string reference for the added reducer.
     * @param {Function} reducer - The reducer function to be added.
     * 
     * @returns void;
     */
    appState.addReducer = function (key, reducer) {
        _reducers[key] = reducer;
        appState.replaceReducer(_createRootReducer());
    }

    /**
     * Removes the reducer from application state.
     * 
     * &nbsp;
     * 
     * @function removeReducer (key: string): void
     * 
     * @param {string} key - The string reference for the removed reducer.
     * 
     * @returns void;
     */
    appState.removeReducer = function (key) {
        delete _reducers[key];
        appState.replaceReducer(_createRootReducer());
    }
    
    return appState;
})();

/**
 * <Notes>
 * 
 * Add parametrization to store creation (if needed), may include middleware and initial state.
 * May export compose() from redux, for convenience. 
 */
