import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Ellipser } from './Ellipser';

// Fix double function , messageList random selector
export function Loading ({messageList = [], interval = 5000}) {
    let [message, setMessage] = useState(messageList[Math.floor(Math.random() * messageList.length)]);

    useEffect(() => {
        let intervalId = setInterval(() => {
            setMessage(messageList[Math.floor(Math.random() * messageList.length)])
        }, interval);
        
        return () => clearInterval(intervalId);
    }, [messageList, interval])


    return <Ellipser message={message} ellipseCount={10} />
}

Loading.propTypes = {
    messageList: PropTypes.array,
    interval: PropTypes.number
}