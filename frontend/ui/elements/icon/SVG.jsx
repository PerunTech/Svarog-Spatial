import { React, PropTypes} from 'perun-core';
import { util } from '../../../core';
import { registry } from '../../../assets';

/**
 * A Scalable Vector Graphics element.
 * 
 * Helper for rendering inline svg elements in React. Will include and pass all possible svg attributes, 
 * provided by the caller, to the underlining element that is rendered. Provides reasonable defaults 
 * for the rendered svg as well as a simplified approach to rendering icons from the registry.
 * 
 * For a list of all valid props see: https://developer.mozilla.org/en-US/docs/Web/SVG.
 * 
 * &nbsp;
 * 
 * @function SVG(props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} props.name - Name of the icon. Reference key in the icon registry.
 * @param {*} [props.size] - Size of the icon, Any browser unit is valid (px, rem ...). 
 *            Default is 24px as convention, try not to change this. Applies to both width and height,
 *            as non-rectangular icons are just silly.
 * @param {*} [props.style] - The style object applied to the rendered svg element. See function body for defaults.
 * 
 * @returns JSX;
 */
export function SVG ({name, size, style, ...props}) {
    const {path, ...opt} = registry.getSVG(name),
        _props = util.obj.assign(props, opt),
        _style = util.obj.assign({   
            // Use CSS instead of the width / height attr. in order to support non-pixel units.
            // style.width overrides svg.width attribute by design, height as well,
            // don't bother passing them as individual props, size will be used instead.    
            width: size, 
            height: size,
            // inherit fill color from parent.
            fill: "currentcolor",
            verticalAlign: "middle"
        }, style);

    return <svg id={name} {..._props} style={_style} >{path}</svg>;
}

SVG.defaultProps = {
    size: 24,
    style: {},
    viewBox: '0 0 512 512',
    preserveAspectRatio: 'xMidYMid meet'
};
SVG.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.object
};