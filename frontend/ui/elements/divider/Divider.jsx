import { React, PropTypes} from 'perun-core';

export function Divider ({vertical = true, ...props}) {
    return vertical 
        ? <span className='divider-vertical' {...props} />
        : <div className='divider-horizontal' {...props} />
}

Divider.propTypes = {
    vertical: PropTypes.bool
}