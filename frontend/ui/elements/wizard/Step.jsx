import { React, PropTypes} from 'perun-core';
import style from './Wizard.module.css';

/**
 * Internal element of the Wizard. Represents a single unit of content in the body.
 * Allows for the visualization of HTML elements or React components, supplies all the props
 * provided by the Wizard to the underlining React child.
 * 
 * @function Step (children: *, props: *): JSX 
 * 
 * @param {*} props - Properties.
 * @param {children} [props.children] - The child element to be rendered as a wizard step.
 * @param {...any} [props.acc] - Properties of the child. 
 * 
 * @returns JSX;
 */
export function Step ({children, ...props}) {
    return <div className={style['wizard-step']}>
        {children instanceof Element ? children : React.cloneElement(children, props)}
    </div>
}

Step.propTypes = {
    children: PropTypes.node
}