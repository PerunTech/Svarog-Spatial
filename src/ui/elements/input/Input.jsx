import React from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';

/**
 * An input element.
 * 
 * &nbsp;
 * 
 * @function Input (props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} [props.value] - The `value` attribute of the underlying input. Controllable via onChange.
 * @param {Function} [props.onChange] - A callback fired when the `value` prop changes.
 * @param {string} [props.type] - The HTML input `type`, default is `text`.For full list, see:
 *                 https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input.
 * @param {string} [props.id] - Id of the element
 * @param {string} [props.prefix] - Element style type, usually project-specific. Defaults to 'form-control'.
 * @param {string} [props.className] - Element style. Base customization.
 * @param {string} [props.size] - Input size variants, choices are `'sm' || 'lg'`.
 * @param {boolean} [props.plaintext] - Render the input as plain text. Generally used along side `readOnly`.
 * @param {*} [props.readOnly] - Make the element readonly. Flag default is `false`
 * @param {*} [props.isValid] - Add "valid" validation styles to the element.
 * @param {*} [props.isInvalid] - Add "invalid" validation styles to the element and accompanying label.
 * @param {*} [props.disabled] - Make the element disabled.
 * @param {*} [props.as] - The underlying HTML element to use when rendering the FormControl.
 *            Exit strategy if you want the input to be a different HTML element.
 * 
 * @returns JSX;
 */
export function Input ({type, id, prefix, className, size, plaintext, readOnly, isValid, isInvalid,  ...props}) {
    const { as: Component = 'input' } = props,
        typeClass = () => {
            return plaintext
                ? { [`${prefix}-plaintext`]: true }
                : type === 'file'
                    ? { [`${prefix}-file`]: true }
                    : { [prefix]: true, [`${prefix}-${size}`]: size };
        },
        style = util.dom.buildClassname(className, typeClass(), isValid && `is-valid`, isInvalid && `is-invalid`);

    return <Component {...props} 
        type={type} 
        id={String(id)}
        name={String(props.name || id)}
        className={style} 
        readOnly={readOnly} />;
}

Input.defaultProps = {
    type: 'text',
    id: 'input',
    prefix: 'form-control',
    size: 'sm',  
    readOnly: false
}
Input.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    type: PropTypes.string,
    id: PropTypes.string,
    prefix: PropTypes.string,
    size: PropTypes.string,
    plaintext: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    isValid: PropTypes.bool,
    isInvalid: PropTypes.bool,
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};