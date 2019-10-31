import { Class } from '../core/Class'
import { Map } from '../core/map/Map'

export function Handler () {
    this._map = Map.getInstance();
}