import React from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';

/**
 * There are situations due to browser quirks or CSS where
 * an anchor tag is needed, while semantically a button tag is
 * the better choice. This component ensures that when an anchor
 * is used like a button, it will be accessible.
 * 
 * It also emulates input "disabled" behavior for links,
 * which is usually desirable for Buttons, Navs etc.
 * 
 * &nbsp;
 * 
 * @function Anchor(props: any): JSX
 * 
 * @param {props} props - Properties.
 * 
 * @returns JSX;  
 */
export function Anchor ({as: Component = 'a', ...props}) {
    const { href, onClick, onKeyDown, disabled } = props,
        handleClick = e => {
            (disabled || isTrivialHref(href)) && e.preventDefault();
            disabled ? event.stopPropagation() : (onClick && onClick(e));
        },
        handleKeyDown = e => e.key === ' ' && (e.preventDefault(), handleClick(e)),
        isTrivialHref = href => !href || href.trim() === '#';

        if (isTrivialHref(href)) { props.role = props.role || 'button', props.href = props.href || '#'; }
        if (disabled) { props.tabIndex = -1, props['aria-disabled'] = true }

    return <Component {...props} onClick={handleClick} onKeyDown={util.fn.chain(handleKeyDown, onKeyDown)} />
}

Anchor.propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    as: PropTypes.elementType, /* this is sort of silly but needed for Button */
};