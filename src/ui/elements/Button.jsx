import React from 'react';
import PropTypes from 'prop-types';

export function Button ({id, title, icon, onClick}) {
    return <div id={id + '_container'} title={title} className='button-container' onClick={onClick}>
        <a id={id} className='leaflet-buttons-control-button'>
            <div id={id + '_icon'} className={icon} />
        </a>
    </div>
}

Button.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func
}