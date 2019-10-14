/*
import React from 'react';
import PropTypes from 'prop-types'

export class MapLoading extends React.Component {
    static propTypes = {
        msgLIst: PropTypes.array
    }
    constructor (props) {
        super(props)
        this.state = {
            msg: '',
            idx: 0
        }
        this.msgList = [
            'Please wait',
            'Fetching geometry data'
        ].concat(props.msgList)
    }

    componentDidMount () {
        function getSampleMessage () {
            return this.msgList[Math.floor(Math.random() * this.msgList.length)]
        }
        // init default
        this.setState({msg: getSampleMessage()})
        // start clock
        let idx = setInterval(function (ref) {
            ref.setState({msg: getSampleMessage()})
        }, 5000, this)
        // set clock id
        this.setState({idx: idx})
    }

    componentWillUnmount () {
        // reset clock
        clearInterval(this.state.idx)
    }

    render () {
        return  <div id='loaderPosition' className='loaderPosition'>
        <div id='mapLoading' className='mapLoading' >
            {this.state.msg}
            <div className='map-loading-ripple'><div /><div /></div>
        </div>
    </div>
    }
}



import React, { useState, useEffect } from 'react';

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

function _getText () {
    const msgList = [
        'Please wait',
        'Fetching geometry data',
    ];

    return msgList[Math.floor(Math.random() * msgList.length)];
}
*/
