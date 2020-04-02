import React from 'react';
import PropTypes from 'prop-types';

/**
 * A raster image element.
 * 
 * Requires a single mandatory argument `name` for init. Name should be a className
 * with the background-image attribute pointing to a local bitmap image in the path.
 * 
 * Avoids all the complications of the <image> element and the async nature of the 
 * `src` attribute on DOM creation. 
 * 
 * &nbsp;
 * 
 * @function Bitmap (name: string, size: string, style: object, props: *):JSX
 * 
 * @param {*} props - Properties.
 * @param {string} props.name - The className of the icon, with the background-image attribute pointing to image path.
 * @param {string} [props.size] - Size in any DOM valid units, default is 24px. Applies to both height and width,
 *                 as non-rectangular icons are just silly.
 * @param {Object} [props.style] - The style object to be applied to the element.
 * 
 * @returns JSX;
 */
export function Bitmap ({name, size, style, ...props}) {
    const _style = {
        ...style,
        width: size,
        height: size
    };

    return <i id={name} {...props} style={_style} className={name} />;
}

Bitmap.defaultProps = { size: '24px' };
Bitmap.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.object
};