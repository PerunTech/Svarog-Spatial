import React from 'react'
import PropTypes from 'prop-types'
import { Spinner } from './Spinner'

export class Loading extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            msg: '',
            intID: null
        }
        this.getMsg = this.getMsg.bind(this);
    }

    getMsg () { 
        return this.props.msgList[Math.floor(Math.random() * this.props.msgList.length)]; 
    }

    componentDidMount () {
        // init default
        this.setState({msg: this.getMsg()});
        // start clock
        let intID = setInterval(function (ref) {
            ref.setState({msg: ref.getMsg()})
        }, 5000, this);
        // set clock id
        this.setState({idx: intID});
    }

    componentWillUnmount () {
        clearInterval(this.state.intID);
    }

    render () {
        return <Spinner msg={this.state.msg} />
    }
}

Loading.defaultProps = {
    msgList: [],
    int: 5000
}

Loading.propTypes = {
    msgList: PropTypes.array,
    int: PropTypes.number
}