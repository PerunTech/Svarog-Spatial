import {useRef, useEffect} from 'react'

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
export function useMount (...fns) { useEffect(() => { fns.map(fn => fn()); }, []); } //eslint-disable-line

/**
 * A custom hook which `does not execute on intial render` ( unlike useEffect ) and
 * only runs when its dependency array changes (like useEffect).
 * 
 * Requires an individual declaration for each effect and its dependency (same as useEffect).
 * Implements `useEffect` with a ref internally.
 * 
 * If the function `fn` contains arguments, bind it via fn.bind(context, args) in the caller.
 * 
 * &nbsp;
 * 
 * @function useUpdate (fn: Function, deps: any[]): void
 * 
 * @param {Function} fn - The callback function to be executed when the input `deps` change.
 * @param {Array} deps - The dependency array.
 * 
 * @returns void;
 */
export function useUpdate (fn, deps) {
    const didMount = useRef(false);
    useEffect(() => { didMount.current ? fn() : didMount.current = true }, deps); //eslint-disable-line
}