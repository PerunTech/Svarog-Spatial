import { Util } from '../Util'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from './Thunk'

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
 * Redux store instance.
 * The whole state tree of the application.
 */
export const store = createStore(_createRootReducer(), applyMiddleware(thunk));

/**
 * `#revise_me`
 * 
 * @function createReducer (initialState: Object): void
 * 
  * @param {Object} initialState - The state slice to be managed by the reducer.
  * 
  * @returns void;
 */
store.createReducer = (key, initialState) => 
    store.addReducer(key, (state = initialState, action) => {
        return Util.hasProp(state, action.type)
            ? Util.assign({}, state, {[action.type]: action.value})
            : state;
});


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
store.addReducer = function (key, reducer) {
    _reducers[key] = reducer;
    this.replaceReducer(_createRootReducer());
};

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
store.removeReducer = function (key) {
    delete _reducers[key];
    this.replaceReducer(_createRootReducer());
};

/**
 * <Notes>
 * 
 * Add parametrization to store creation (if needed), may include middleware and initial state.
 * May export compose() from redux, for convenience. 
 */
