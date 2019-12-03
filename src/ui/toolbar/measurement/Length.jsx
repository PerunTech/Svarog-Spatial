import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../..';

export function Length ({id, title, onClick, activeId, setId}) {

    return <div 
        id={id} 
        title={title} 
        className={'button-container' + (id === activeId ? ' active' : '')}
        onClick={(e) => {
            console.log(e.currentTarget)
            setId(e.currentTarget.id), onClick()
        }}>
            <Icon className='control-icon leaflet-pm-icon-length' />
    </div>
}

Length.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    activeId: PropTypes.string,
    setId: PropTypes.func
}