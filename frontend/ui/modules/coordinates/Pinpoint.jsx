import { React, PropTypes} from 'perun-core';
import { Button, Icon } from '../..';

export function Pinpoint ({coordinates, projection, valid, ...props}) {
    return <Button
        onClick={() => {}} 
        children={<Icon name='pinpoint' />} 
        disabled={!valid} />
}