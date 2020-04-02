import React from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';
import { Anchor } from '../..';

/**
 * A button element.
 * 
 * &nbsp;
 * 
 * @function Button(props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} [props.className] - Element style. Base customization.
 * @param {string} [props.prefix] - Element style type, usually project-specific. Defaults to 'btn'.
 * @param {string} [props.variant] - Style variation including: 
 *                  `'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light', 'link'`
 *                  as well as "outline" versions (prefixed by 'outline-*'):
 *                  `'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', etc.`
 * @param {string} [props.type] - Defines HTML button type attribute. Defaults to 'button'.
 * @param {string} [props.size] - Specifies a large or small button `'sm' || 'lg'`.
 * @param {boolean} [props.block] - Spans the full width of the Button parent.
 * @param {boolean} [props.active] - Manually set the visual state of the button to `:active`.
 * @param {string} [props.as] - Element type. Exit strategy if you want the button to be a different HTML element.
 * 
 * @returns JSX;
 */
export function Button ({className, prefix, variant, type, size, block, active, as, ...props }) {
    const {disabled, href} = props,
        style = util.dom.buildClassname(
            className,
            prefix,
            active && 'active',
            `${prefix}-${variant}`,
            block && `${prefix}-block`,
            size && `${prefix}-${size}`,
            disabled && 'disabled'
        ),
        Component = as || 'button';

        (!as) && (props.type = type);

    return href
        ? <Anchor {...props} as={as} className={style} />
        : <Component {...props} className={style} />;
}

Button.defaultProps = {
    prefix: 'btn',
    variant: 'light',
    active: false,
    disabled: false,
    type: 'button',
    size: 'sm'
};
Button.propTypes = {
    className: PropTypes.string,
    prefix: PropTypes.string,
    variant: PropTypes.string,
    size: PropTypes.string,
    block: PropTypes.bool,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    href: PropTypes.string,
    type: PropTypes.oneOf(['button', 'reset', 'submit', null]),
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};