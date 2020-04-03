import { React } from 'perun-core';

/**
 * Executes function arguments when component is mounted ( initial render only ).
 * 
 * A simple custom hook for useEffect(fn, []). `Do not use` if you don't know
 * what the empty array argument in useEffect means. 
 * 
 * If the function `fn` contains arguments, bind it via fn.bind(context, args) in the caller.
 * 
 * &nbsp;
 * 
 * @function useMount (fns: Function[]): void
 * 
 * @param {...Function} fns
 * 
 * @returns void;
 */
export function useMount (...fns) { React.useEffect(() => { fns.map(fn => fn()); }, []); } //eslint-disable-line