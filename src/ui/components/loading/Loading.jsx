import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Ellipser } from '..';

/**
 * Loading widget.
 * 
 * &nbsp;
 * 
 * @function Loading (messageList: String[], interval: number): Ellipser
 * 
 * @param {Object} props - Properties.
 * @param {String[]} [props.messageList] - List of messages. A random item will be shown.
 * @param {number} [props.interval] - The time interval (in ms) for toggling of the message.
 * 
 * @returns Ellipser; 
 */
export function Loading ({messageList = [], interval = 5000}) {
    let [message, setMessage] = useState();

    useEffect(() => {
        // Pass a named function to setInterval and call self. 
        // Sets message immediately rather than after interval.
        let intID = setInterval(function fn () {
            setMessage(messageList[Math.floor(Math.random() * messageList.length)])
            return fn;
        }(), interval);
        
        return () => clearInterval(intID);
    }, [messageList, interval])

    return <Ellipser message={message} ellipseCount={10} />
}

Loading.propTypes = {
    messageList: PropTypes.array,
    interval: PropTypes.number
}