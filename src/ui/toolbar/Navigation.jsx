import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ButtonSet} from '..';
import { navHandler } from '../../tools';
import { Map } from '../../core';
import { PROCESS_ENUM } from '../../config';

export function Navigation ({activeId}) {
    return <ButtonSet id='navigation' >
        <div 
            id='zoomIn'
            title='Zoom In'
            className='button-container'
            onClick={() =>  Map.zoomIn()} >
            <Icon className='control-icon leaflet-pm-icon-zoom-in' />
        </div>
        <div 
            id='zoomOut'
            title='Zoom Out'
            className='button-container'
            onClick={() =>  Map.zoomOut()} >
            <Icon className='control-icon leaflet-pm-icon-zoom-out' />
        </div>
        <div 
            id='search'
            title='Search'
            className='button-container'
            onClick={navHandler.search} >
            <Icon className='control-icon leaflet-pm-icon-search' />
        </div>
        <div 
            id='origin'
            title='Go to Origin'
            className='button-container'
            onClick={navHandler.origin} >
            <Icon className='control-icon leaflet-pm-icon-origin' />
        </div>
        <div 
            id='location'
            title='Go to Location'
            className='button-container'
            onClick={navHandler.point} >
            <Icon className='control-icon leaflet-pm-icon-location' />
        </div>
        <div 
            id={PROCESS_ENUM.view}
            title='Go to View'
            className='button-container'
            onClick={navHandler.boxZoom} >
            <Icon className='control-icon leaflet-pm-icon-view' />
        </div>
    </ButtonSet>
}

Navigation.propTypes = {
    activeId: PropTypes.string
};