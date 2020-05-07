import { React, PropTypes} from 'perun-core';
import { SVG, Bitmap } from '../..';

/**
 * A helper API over the different image types of the application. Simplifies access and instantiation.
 * 
 * The only requires argument is `name`, by default will render an SVG element from the icon registry
 * with the key as provided in `name`, while using all the defaults of the image, such as size,
 * viewBox and path arguments.
 * 
 * &nbsp;
 * 
 * @function Icon (name: string, vector: boolean, ...props:*): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} props.name - The name of the icon, in vector icons it is the key in icon registry,
 *                 in raster icons it is the classname with the background-image path.
 * @param {boolean} [props.vector] - Boolean switch for raster / vector image. Default is true (thus vector).
 * 
 * @returns JSX;
 */
export function Icon ({name, vector, ...props}) {
    return <>
        {vector
            ? <SVG name={name} {...props} /> 
            : <Bitmap name={name} {...props} />}
    </>;
}

Icon.defaultProps = {
    size: '24px',
    vector: true
};
Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vector: PropTypes.bool,
};