import React from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';

/**
 * A div container for grouping of buttons into a visual set.
 * 
 * &nbsp;
 * 
 * @function ButtonGroup(props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} [props.className] - Element style. Base customization.
 * @param {string} [props.prefix] - Element style type, usually project-specific. Defaults to 'btn-group'.
 * @param {string} [props.size] - Specifies a large or small button group `'sm' || 'lg'`.
 * @param {boolean} [props.vertical] - Make the set of Buttons appear vertically stacked. Default is `false`.
 * @param {boolean} [props.toggle] - Display as a button toggle group. Default is `false`.
 * @param {string} [props.role] - An ARIA role describing the button group. Usually the default "group" role is fine. 
 * @param {string} [props.as] - Element type. Exit strategy if you want the button to be a different HTML element.
 * 
 * @returns JSX;
 */
export function ButtonGroup ({className, prefix, size, vertical, toggle, ...props}) {
    const { as: Component = 'div' } = props,
        style = util.dom.buildClassname(
            className,
            prefix,
            vertical && `${prefix}-vertical`,
            size && `${prefix}-${size}`,
            toggle && `${prefix}-toggle`,
        );

    return <Component {...props} className={style} />
}

ButtonGroup.defaultProps = {
    prefix: 'btn-group',
    size: 'sm',
    vertical: false,
    toggle: false,
    role: 'group'
}
ButtonGroup.propTypes = {
    className: PropTypes.string,
    prefix: PropTypes.string,
    size: PropTypes.string,
    vertical: PropTypes.bool,
    toggle: PropTypes.bool,
    role: PropTypes.string,
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};