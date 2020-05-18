import { React } from 'perun-core';
import { util } from '../../../core';

export function useMouseLeave() {
    const [mouseLeft, setMouseLeft] = React.useState(true);
    const elementRef = React.useRef(null);

  // Check whether the pointer is still within our element, every 50ms heartbeat
    const handleMouseMove = React.useRef(util.throttle((e) => {
        if (!elementRef || !elementRef.current) return;

        const rect = elementRef.current.getBoundingClientRect();

        (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) 
            ? setMouseLeft(true)
            : setMouseLeft(false);
    }, 50)).current;

    // Start tracking the pointer when it enters our element
    const handleMouseEnter = React.useRef(() => 
        window.addEventListener('mousemove', handleMouseMove)).current;

    // See https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
    // Dynamic ref because the element may be null at times
    const setRef = React.useCallback((node) => {
        // Make sure to cleanup any events/references added to the last instance
        (elementRef && elementRef.current) 
            && elementRef.current.removeEventListener('mouseenter', handleMouseEnter);

        (node !== null) // Save a reference to the node
            && (node.addEventListener('mouseenter', handleMouseEnter), elementRef.current = node);//revise_me, this line.
    }, [handleMouseEnter]);

    // Cleanup the pointer tracking when the mouse is not over our element anymore
    React.useEffect(() => { (mouseLeft) 
        && window.removeEventListener('mousemove', handleMouseMove); }, [mouseLeft, handleMouseMove]);

    // Cleanup events on component unmount
    React.useEffect(() => {
        return () => {
            (elementRef && elementRef.current)
                && elementRef.current.removeEventListener('mouseenter', handleMouseEnter);

            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove, handleMouseEnter]);

    return [mouseLeft, setRef];
}