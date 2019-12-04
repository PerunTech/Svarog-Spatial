import React from 'react';
import PropTypes from 'prop-types';

export function Icon ({className}) {
    return <a className='leaflet-buttons-control-button' >
            <div className={className} />
        </a>
}

Icon.propTypes = {
    className: PropTypes.string,
};


