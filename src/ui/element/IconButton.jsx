import React from 'react';
import PropTypes from 'prop-types';

export function IconButton ({id, title, className, onClick}) {
    return <div id={id + '_container'} title={title} className='button-container' onClick={onClick}>
        <a id={id} className='leaflet-buttons-control-button' >
            <div id={id + '_icon'} className={className} />
        </a>
    </div>
}

IconButton.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func
};
