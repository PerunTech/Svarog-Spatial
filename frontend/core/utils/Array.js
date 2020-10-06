/**
 * Array utilities. 
 * 
 * Array.prototype is preserved, these functions enclose rather than modify
 * the Array object. Keep it that way.
 * 
 * &nbsp;
 * 
 * @namespace util.arr
 */
export const arr = {
    /**
     * Compatibility polyfill for [Array.isArray]
     * 
     * &nbsp;
     * 
     * @function isArray (Object): boolean
     * 
     * @param {Object} obj - The object to be checked.
     *
     * @returns boolean;
     */
    isArray: Array.isArray || function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    },

    /**
     * Flattens a nested array of any arbitrary levels to a composed, single-level array. 
     * 
     * &nbsp;
     * 
     * @function flattenDeep (arr: any[]): []
     * 
     * @param {Array} arr - The array to be flattened.
     * 
     * @returns [];
     */
    flattenDeep (arr) {
        return arr
            .filter(x => 
                ![null, '', undefined].includes(x))
            .reduce((acc, val) => 
                acc.concat(this.isArray(val) 
                    ? this.flattenDeep(val) 
                    : val), []);
    },

    /**
     * Creates a flat array of elements coerced to the given `type`.
     * 
     * The input `obj` can be any javascript primitive or an arbitrarily nested object / array,
     * for which its values (and keys) can be converted into the specified type. 
     * 
     * All values will be trimmed for all whitespaces and separated into separate elements
     * for any colon, semicolon or escape slash.
     * 
     * &nbsp;
     * 
     * @function normalize (obj: any type?: PrimitiveConstructor): [type, type, ...type]
     * 
     * @param {*} obj - Any JavaScript object.
     * @param {Object} [type] - A JavaScript primitive constructor type, i.e Number/String (capital).
     * 
     * @returns [type, type, ...type]
     */
    normalize (obj, type = String) {
        return obj.toString().replace(/\s+/g, '').split(/[;,/]/).map(type);
    },

    /**
     * Replaces an element in an array for a given index.
     * 
     * If the index exceeds the array length, no replacement occurs.
     * Returns a new array with copied elements.
     * 
     * This utility provides a functional approach to basic array modification,
     * given the shortcoming of the Array.prototype.splice method which returns
     * the replaced element instead of the resulting array set.
     * 
     * &nbsp;
     * 
     * @function replaceElement (arr: Array, idx: number, el: any): []
     * 
     * @param {Array} arr - The array to be modified. 
     * @param {number} idx - The index where the modification occurs.
     * @param {*} el - The element to be inserted.
     * 
     * @return [ ...arr, arr[id] = el ];
     */
    replaceElement (arr, idx, el) {
        let result = [ ...arr ];

        idx < result.length
            && (result[idx] = el);

        return result;
    }
};