import React from 'react';
import PropTypes from 'prop-types';

export function Button ({id, title, className, style, icon, onClick}) {
    return <div id={id + '_container'} title={title} className='button-container' style={style} onClick={onClick}>
        <a id={id} className={className}>
            <div id={id + '_icon'} className={icon} />
        </a>
    </div>
}

Button.defaultProps = {
    className: 'leaflet-buttons-control-button',
}

Button.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    icon: PropTypes.string,
    onClick: PropTypes.func
}