import { React, PropTypes} from 'perun-core';
import { coordinate as coordUtil, limits } from '../../../tools';
import { Input, Button } from '../..';

export function Coordinates ({coordinates, onChange, ...props}) {
    const { projected, validated, onBlur, ...inputProps } = props;

    const isValid = (coordinate, idx) => !(coordinate.length > 3) 
        ? {}
        : limits.isBounded(coordinate, idx, projected)
            ? { isValid: true }
            : { isInvalid: true };

    return Object.values(coordinates).map((coordinate, idx) => {
        return <div key={idx} className='coordinate' onBlur={onBlur} >
            <Input {...inputProps}
                id={String(idx)}
                value={coordinate}
                placeholder={idx === 0 ? 'Абсциса X' : 'Ордината Y'}
                onChange={onChange} 
                {...(validated && isValid(coordinate, idx))} />
            <div className='invalid-feedback' >{limits.getRange(idx, projected)}</div>
        </div>
    })
}

Coordinates.defaultProps = {
    projected: true,
    validated: true
};