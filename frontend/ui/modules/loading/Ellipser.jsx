import { React, PropTypes} from 'perun-core';

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
    return <div id='ellipser' className='ellipser' >
        <div id='globe' className='globe'>
            {[...Array(ellipseCount)].map((v, i) => { 
                return <div key={'e'+i} className='ellipse' /> })}
        </div>
        {message}
    </div> 
}

Ellipser.propTypes = {
    message: PropTypes.string,
    ellipseCount: PropTypes.number
}