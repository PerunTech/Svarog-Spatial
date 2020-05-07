import { arr } from './Array';
import { dom } from './DOM';
import { fn } from './Function';
import { obj } from './Object';

/**
 * Assembly of all module utilities under a single namespace.
 * 
 * @namespace util
 */
export const util = {
    ...arr,
    ...dom,
    ...fn,
    ...obj
};