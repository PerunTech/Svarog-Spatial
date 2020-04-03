import { React, PropTypes} from 'perun-core';

export function Divider ({vertical, ...props}) {
    return vertical 
        ? <span className='divider-vertical' {...props} />
        : <div className='divider-horizontal' {...props} />
}

Divider.defaultProps = {
    vertical: true
}
Divider.propTypes = {
    vertical: PropTypes.bool
}