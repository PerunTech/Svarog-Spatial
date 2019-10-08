import React, { useState, useEffect } from 'react';

/**
 * 
 */
export const MapLoading = () => {
    let [msg, setMsg] = useState(_getText());
    
    useEffect(() => {
        let intID = setInterval(() => { setMsg(_getText); }, 5000) 

        return clearInterval(intID);
    }, [])

    return  <div id='loaderPosition' className='loaderPosition'>
        <div id='mapLoading' className='mapLoading' >
            {msg}
            <div className='map-loading-ripple'><div /><div /></div>
        </div>
    </div>
} 

/**
 * 
 */
function _getText () {
    const msgList = [
        'Please wait',
        'Fetching geometry data',
    ];

    return msgList[Math.floor(Math.random() * msgList.length)];
}