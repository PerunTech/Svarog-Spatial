import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../..';

export function Pinpoint ({coordinates, projection, valid, ...props}) {
    return <Button
        onClick={() => {}} 
        children={<Icon name='pinpoint' />} 
        disabled={!valid} />
}