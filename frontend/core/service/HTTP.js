import { axios } from 'perun-core';
import { util, store } from '..';

/**
 * Web service utilities.
 * 
 * Single namespace for the application - server communication. 
 * Asynchronous mode of operation, do your own resolve / catch when Promises are returned.
 * 
 * &nbsp;
 * 
 * @namespace http
 */
export const http = {
    /**
     * Calls a web service.
     * 
     * The implementation uses pre-configured (static) objects stored in the application state, as the default
     * available web services to the app. These are referred by the `key` argument, as in store.state.http.key.
     * Any customization of these objects (for an individual call) is done via passing an optional `opt` argument
     * by the caller. 
     * 
     * This function currently uses {@link https://github.com/axios/axios} as an internal implementation.
     * See the api docs for the full list of configrables, such as pre/post transformations and callbacks,
     * which you can pass to `opt` in order to costumize the call. The common options are documented below. 
     * 
     * Prioritize expressing requests' configuration in the application state (under .http), rather than 
     * delegating that responsibility to the caller (most often action creators). 
     * 
     * &nbsp;
     * 
     * @function call (key:string, opt?: Object): Promise<*>
     * 
     * @param {string} key - Web service type reference. A registered key in store.state.http[<key>],
     *                 its value is a completely described http configuration object.
     * @param {Object} [opt] - Optional configuration object. Defers control to the caller,
     *                 will override and/or completely replace any call configration in the state.
     * @param {string} [opt.url] - The relative server path to resources that will be requested. Mandatory.
     *                 Any parameters can be embedded as foreign keys of store.state records. The used format is
     *                 `/{path}/` where path is any location accessible on the root application state.
     * @param {string} [opt.baseUrl] - The path of the server. Default is `window.location.host + '/services'`.
     *                 Override this if your web resources are located remotely.
     * @param {string} [opt.method] - Type of request.  Can be: `'get'`, `'post'` etc.
     * @param {string} [opt.responseType] - Mime type, indicates the type of data that the server will respond with.
     * @param {Object} [opt.headers] - Custom headers to be sent with the request.
     * @param {Object} [opt.params] - URL parameters to be sent with the request (plain/URLSearchParams object).
     * @param {*} [opt.data] - Data to be sent as the request body. Available for  `'post'`, `'put'` and `'patch'`
     *            methods only. Format can be string, serializabile object, buffer, stream.
     * 
     * @returns Promise<*>; 
     */
    call (key, opt = {}) { return axios(_resolveParams(util.assign(_getConfig(key), opt))); },
    
    /**
     * `#revise_me`, this needs work and tests. Figure out mappings between keys and configuration iterables.
     * Calls multiple web services by firing conccurent requests.
     * 
     * @function callConcurrently (iterable: string[], opt?: any[]): Promise<any[]>
     * 
     * @param {string[]} iterable
     * @param {any[]} [opt]
     * 
     * @return Promise<any[]>;
     */
    callConcurrently (iterable, opt = []) {
        return axios.all(iterable.map((key, i) => {
            return axios(_resolveParams(util.assign(_getConfig(key), opt[i]))); //  || {url: ''}
        }));
    }
};

/**
 * Axios instance defaults.
 * Applies to all requests made via this module, unless explicitly overriden.
 */
// util.assign(axios.defaults, {
   //  baseURL: 'http://localhost:8091'
//});

/**
 * Transforms path paramaters of the request, represented as references to other state records.
 * Changes the string reference to the current (at time of call) store record value.
 * 
 * &nbsp;
 * 
 * @private
 * @function _resolveParams (config: Object): config
 * 
 * @param {Object} config - The http request configuration object.
 * @param {string} config.url -  The relative server path to resources that will be requested.
 *                 The string to be transformed for any embedded parameters of the call. 
 * 
 * @returns config;    
 */
function _resolveParams ({url}) {
    // Check if call configuration contains embedded parameters. 
    // Exit at first found instance and transform, otherwise return input.
    if (url.indexOf('{') > -1 ) {
        // Access state on top, only once, right before call. Guarantees synchronicity.
        const state = store.getState();
        //Modify path, disassemble => resolve foreign keys (paths to other state slices) and assemble again.
        arguments[0].url = url.split('/').map(str => { 
            // Distinguish parameters substrings from other subparts of the path. Signature is {path}.
            return str.charAt(0) === '{' && str.charAt(str.length - 1) === '}' 
                ? util.access(state, str.slice(1, -1))
                : str;
            }).join('/');
    }
    // return input configuration object, potentially transformed.
    // util.assign guarantees a shallow-merged single entity, thus the argument index here is always 0.
    return arguments[0];
}

/**
 * Get web service call configuration from application state.
 * Implements default fallback for non-existent keys supplied by the caller.
 * 
 * `#revise_me`, Should we throw or return an empty object? An empty object may be 
 * populated by custom configuration supplied by the caller, making static store entries
 * irrelevant and providing an exit for pure custom calls.
 * 
 * &nbsp;
 * 
 * @private
 * @function _getCall (key: string): config
 * 
 * @param {string} key - Web service type reference.
 * 
 * @returns config;
 */
function _getConfig (key) {
    const { http } = store.getState();
    return http[key] || http['default'];
}