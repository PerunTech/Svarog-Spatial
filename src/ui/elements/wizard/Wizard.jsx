import React, { useState, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';
import { Step } from '../..';
import style from './Wizard.module.css';

/**
 * A controller for multi-step forms and wizard-like components.
 * 
 * Provides an internal simple counter of where the user is currently located 
 * in the wizard flow as well as several generic callbacks to help with transitions
 * between steps.
 * 
 * Visualization is split in two sub-parts, head and body. The body will render the content 
 * of the current step, while the optional head is always shown, commonly used for 
 * navigational utility. 
 * 
 * @function Wizard (children: *, nav: *, opt: Object): Wizard
 * 
 * @param {*} props  - Properties.
 * @param {*} [props.children] - Children elements to be rendered in the body of the Wizard.
 * @param {React.ReactNode} [props.nav] - Optional navigation component. Helps with the steps.
 * @param {Object} [props.opt] - Configuration object. Defers control for props definition for the steps.
 * @param {Object} [props.opt.initialStep] - Number of the step to be shown on the first render.
 * @param {Object} [props.opt.className] - Style of the Wizard. Defaults to 'wizard'.
 * 
 * @returns JSX;
 */
export function Wizard ({children, nav = null, opt = {initialStep: 0}}) {
    const props = util.obj.assign({
        activeStep: () => activeStep,
        totalSteps: () => children.length - 1,
        goToStep: step => !(step === activeStep || (step < 0 || step > children.length)) && setActive(step),
        next: () => props.goToStep(activeStep + 1),
        prev: () => props.goToStep(activeStep - 1)
    }, opt),
    [activeStep, setActive] = useState([...children][opt.initialStep] ? opt.initialStep : 0);

    return <div className={opt.className || style['wizard']}>
        {nav && cloneElement(nav, props)}
        {children.map((child, i) => {
            return i === activeStep && <Step key={i} {...props}>{child}</Step>})}
    </div>;
}

Wizard.propTypes = {
    children: PropTypes.node,
    nav: PropTypes.node,
    opt: PropTypes.object
};