import React from 'react';
import PropTypes from 'prop-types';

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