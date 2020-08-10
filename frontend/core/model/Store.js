import { util, thunk } from '..'
import { createStore, combineReducers, applyMiddleware } from 'redux';

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
 * Adds a state slice to store.
 * 
 * Simplifies state management, provides working with object literals instead of reducer functions.
 * Internally creates a reducer for the given state slice.
 * 
 * &nbsp;  
 * 
 * @function addState (key: string, initialState: Object): void
 * 
 * @param {string} key - The string reference to be used for the added state slice.
 * @param {Object} initialState - The state slice to be managed by the reducer.
 * 
 * @returns void;
 */
store.addState = (key, initialState) => 
    store.addReducer(key, (state = initialState, action) => {
        return util.hasProp(state, action.type)
            ? util.assign({}, state, {[action.type]: action.value})
            : state;
});

/**
 * Removes a state slice from store.
 * 
 * &nbsp;
 * 
 * @function removeState (key:string):void
 * 
 * @param {string} key - The string reference for the removed state slice.
 * 
 * @returns void;
 */
store.removeState = key => store.removeReducer(key);

/**
 * 
 * @param {*} key 
 * @param {*} slice 
 */
store.extendState = (key, slice) => {
    const replaceState = () => {
        // clone the current state for the given argument key (before we delete it two lines below).
        const currSlice = { ...store.getState()[key] }; 
        
        store.removeState(key); // remove the current slice
        store.addState(key, util.assign(currSlice, slice)); // assemble the old and new slice and register.
    }

    util.hasProp(_reducers, key) 
        ? replaceState()
        : store.addState(key, slice);
}
    
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
