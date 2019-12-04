import React from 'react';
import PropTypes from 'prop-types';
import style from './Ellipser.module.css';

/**
 * Renders rotating elipses and a message.
 * To be used as a loading widget while the application is busy.
 * 
 * &nbsp;
 * 
 * @function Ellipser (message?: string, ellipseCount?: number): JSX.Element
 * 
 * @param {Object} [props] - Properties.
 * @param {string} [props.message] - The message to be shown.
 * @param {number} [props.ellipseCount] - The number of ellipses to be rendered (max 10).
 * 
 * @returns JSX.Element;
 */
export function Ellipser ({message='', ellipseCount=7}) {
    return <div id='ellipser' className={style.ellipser} >
      <div id='ellipser-globe' className={style.ellipser_globe}>
        {[...Array(ellipseCount)].map((v, i) => { return <div key={'e'+i} className={style.ellipse}></div> })}
      </div>
      {message}
    </div> 
    
}

Ellipser.propTypes = {
  message: PropTypes.string,
  ellipseCount: PropTypes.number
}