import { React, PropTypes} from 'perun-core';
import { coordinate as coordUtil, limits } from '../../../tools';
import { Input, Button } from '../..';

export function Coordinates ({coordinates, onChange, ...props}) {
    const { projected, labeled, validated, onBlur, ...inputProps } = props;

    const isValid = (coordinate, idx) => !(coordinate.length > 3) 
        ? {}
        : limits.isBounded(coordinate, idx, projected)
            ? { isValid: true }
            : { isInvalid: true };

    return Object.values(coordinates).map((coordinate, idx) => {
        return <React.Fragment key={idx} >
            {labeled && <Button disabled className='as-label'>{idx === 0 ? 'X:' : 'Y:'}</Button>}
            <div className='coordinate' onBlur={onBlur} >
                <Input {...inputProps}
                    id={String(idx)}
                    value={coordinate}
                    placeholder={limits.getRange(idx, true)}
                    onChange={onChange} 
                    {...(validated && isValid(coordinate, idx))} />
                <div className='invalid-feedback' >{limits.getRange(idx, projected)}</div>
            </div>
        </React.Fragment>
    })
}

Coordinates.defaultProps = {
    projected: true,
    labeled: false,
    validated: true
};