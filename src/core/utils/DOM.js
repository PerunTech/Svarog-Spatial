import { arr } from './Array';

/**
 * DOM utilities. 
 * 
 * &nbsp;
 * 
 * @namespace util.dom
 */
export const dom = {
    /**
     * A simple javascript utility for conditionally joining classNames together.
     * 
     * &nbsp;
     * 
     * @function buildClassname (...args: any[]): string
     * 
     * @param {any[]} args - Composite of classnames represented as strings.
     * 
     * @returns classname;
     */
    buildClassname () {
        return [...arguments].map(arg => {
            const type = typeof arg;

            return (arr.isArray(arg) && arg.length)
                ? this.buildClassname(...arg)
                : type === 'object'
                    ? Object.keys(arg).join(' ')
                    : (type === 'string' || type === 'number')
                        ? arg
                        : '';
        }).join(' ');
    }
};