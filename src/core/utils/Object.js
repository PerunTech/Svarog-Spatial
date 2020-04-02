/**
 * `Bread and butter segment of the module, utilites concerning the base entity of the language including
 * object composition, prototypal inheritance and other helpful gimmicks.`
 * 
 * Object.prototype is preserved, these functions enclose rather than modify
 * the Object object. Keep it that way.
 * 
 * &nbsp;
 * 
 * @namespace util.obj
 */
export const obj = {
    /**
     * Creates an object with the specified instance and prototype properties. 
     * 
     * An extension of the base object delegation, provided by `create`.
     * Allows prototypal inheritance and creation of object instance properties  
     * via a single function signature.
     * 
     * @param {*} object - Instance properties.
     * @param {*} prototype - Prototype properties.
     * 
     * @returns A new object with the specified instance and prototype properties;
     */
    assemble (object, prototype = Object) {
        return Object.setPrototypeOf(object, prototype);
    },

    /**
     * `Object delegation, differential inheritance.`
     * 
     * Base JavaScript inheritance. Creates an object that has the specified prototype,
     * and that optionally contains specified property descriptors.
     * 
     * Can create objects 'ex nihilo' (out of nothing) by calling create(null).
     * The result is an object whose prototype points to null (end of chain).
     * 
     * Inherit from a single source (the argument) via delegation, the argument `proto`
     * becomes the prototype (a link to the source) of the newly created object. 
     * Methods and properties which are not found on the resulting object are delegated to 
     * the prototype, up the chain, until the accessed path is found or null is reached.
     * 
     * Changes to the source `proto` are reflected in all objects that inherit from it,
     * such as the result object of this function. Expresses is-a relationship. 
     * 
     * Compatibility polyfill for `Object.create`.
     * 
     * &nbsp;
     * 
     * @function create (proto: Object, properties?: Object): Object
     * 
     * @param {Object} proto - The object which should be the prototype of the newly-created object.
     * @param {Object} [properties] - An object whose enumerable own properties specify property descriptors
     *        to be added to the newly-created object.
     *
     * @return A new object with the specified prototype object and properties;
     */
    create (proto, properties) {
        return Object.create(proto, properties) || (function () {
            function F () {}
            return function (proto) {
                F.prototype = proto;
                return new F();
            };
        })();
    },

    /**
     * `Object cloning, concatenative inheritance.`
     * 
     * Provides inheritance from multiple prototypes. Copies the values of all
     * of the enumerable own properties from one or more source objects to a target object.
     * Returns the target object. Excludes `prototype` of the source(s).
     * 
     * Changes to source(s) are not propagated to targets (clones), as properties are simply copied.
     * Expresses has-a reationship. 
     * 
     * Compatibility polyfill for `Object.assign`.
     * 
     * &nbsp;
     * 
     * @function assign (target: Object, ...src: Object): target & ...src
     * 
     * @param {Object} target - The taget object to copy to.
     * @param  {...Object} src - The source object(s) to copy from.
     * 
     * @returns target & ...src;
     */
    assign (target, ...src) {
        return Object.assign(target, ...src) || (function () {
            return function (target) {
                // Cast target into Object if it is not.
                // Reference is retained, no new objects are created, target is returned (augmented below).
                let result = Object(target); 

                for (let i = 1; i < arguments.length; i++) {
                    let src = arguments[i]
                    if (src !== null && src !== undefined) 
                        {for (let key in src) {
                            if (Object.prototype.hasOwnProperty.call(src, key)) {
                                result[key] = src[key];
                            }
                        }}
                }

                return result;
            }
        })();
    },

    /**
     * `Concatenation of a full prototype chain, i.e aggregation.`
     * 
     * Merges the properties of the `src` object (or multiple objects)
     * into `target` object and returns the latter. Includes `prototype` of all `src` objects.
     * 
     * Flattens `src(s)` unto `target` instance.
     * 
     * Aggre
     * 
     * &nbsp;
     * 
     * @function assignDeep (target: Object, src?: ...Object): target
     *
     * @param {Object} target - Destination object of the merge.
     * @param {...Object} [src] - Source object(s) to be merged.
     *
     * @return target;
     */
    assignDeep (target) {
        let result = Object(target);

        for (let i = 1; i < arguments.length; i++) {
            let src = arguments[i]
            if (src !== null && src !== undefined) 
                {for (let key in src) {
                    result[key] = src[key];
                }}
        }

        return target;
    },

    /**
     * Access `obj` by string `path`.
     *
     * Supports nested structures.
     * Supports dot and bracket notation.
     * Removes string blank spaces.
     * 
     * &nbsp;
     * 
     * @function access (path: string, obj: Object): obj.path || undefined
     *
     * @param {Object} obj - Object to access.
     * @param {string} path - Accessor path, represented as string.
     *
     * @returns obj.path || undefined;
     */
    access (obj, path) {
        return path
            .replace(/\[([^\]]+)]/g, '.$1') // support dot(.) and bracket([]) accessors
            .split('.') // init array on accessing elements
            .filter(s => s) // remove blanks
            .reduce((k, v) => k && k[v], obj); // support nested, null check on accessing keys
    },

    /**
     * Checks if `obj` has own property `prop`.
     * 
     * Solves rule:
     *      Do not access Object.prototype method 'hasOwnProperty' from target object.
     *  
     * &nbsp;
     *  
     * @function hasProp (obj: Object, prop: string | number | symbol): boolean
     * 
     * @param {Object} obj - Object to be checked.
     * @param {string | number | symbol} prop - Property to be found on obj.
     * 
     * @returns boolean;
     */
    hasProp (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },

    /**
     * Improvement on the `typeof` operator.
     * 
     * Duck-typing checks the characteristics of an object against a list of known attributes
     * for a given type (walks like a duck, talks like a duck…).
     * 
     * Because of the limited usefulness of the `typeof` operator, duck-typing is popular in JavaScript.
     * Its also error-prone. For example the arguments object of a Function has a length property
     * and numerically indexed elements, but it is still not an Array.
     * 
     * Using getType is a reliable and easy alternative to duck-typing. Reliable because it talks
     * directly to the internal property of the object, which is set by the browser engine and is not editable;
     * easy because its a three-word check.
     * 
     * &nbsp;
     * 
     * @function getType (obj: any): string
     * 
     * @param {*} obj
     * 
     * @returns string;
     */
    getType (obj) {
        return ({}).toString(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
};