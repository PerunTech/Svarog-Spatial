import { connect as reactConnect } from 'react-redux';

/**
 * Connects a React component to a Redux store.
 * 
 * &nbsp;
 * 
 * @function connect (mapStateToProps?: Function,
 *                    mapDispatchToProps?: Function | Object,
 *                    mergeProps?: Function, 
 *                    options?: Object): Component
 *  
 * @param {Function} [mapStateToProps] - A function for Redux store subscription.
 * @param {Function | Object} [mapDispatchToProps] - A namespace for Redux store actions.
 * @param {Function} [mergeProps] - Specifies props composition of the connected component. 
 * @param {Object} [options] - Configuration object.
 * 
 * @returns A connected React component;
 */
export function connect (mapStateToProps, mapDispatchToProps, mergeProps, options) {
    return reactConnect(mapStateToProps, mapDispatchToProps, mergeProps, options);
}