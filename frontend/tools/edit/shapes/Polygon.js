import { line } from './Line';

/**
 * Edit polygon implementation.
 * 
 * Provides separate namespace for polygon specific methods.
 * Currently all necessary functionality is provided by the implementation of edit.line. 
 */
export const polygon = { ...line };