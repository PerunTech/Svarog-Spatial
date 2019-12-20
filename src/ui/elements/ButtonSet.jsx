import React from 'react';
import PropTypes  from 'prop-types';

export function ButtonSet ({id, className, children}) {
    return <div id={id} className={className} >
        {children}
    </div>
}

ButtonSet.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node
}

ButtonSet.defaultProps = {
    id: 'buttonSet',
    className: 'leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control'
}