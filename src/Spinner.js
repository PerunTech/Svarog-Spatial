import React from 'react'
import PropTypes from 'prop-types'

export function Spinner ({msg}) {
    return <div id='loading' className='loading'>
        <div className='loading-ripple'><div /><div /></div>
        {msg}
    </div>
}

Spinner.propTypes = {
    msg: PropTypes.string,
}