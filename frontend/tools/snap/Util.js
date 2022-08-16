import { factory } from '../../core';

// this function is used with the .sort(prioritiseSort(key, sortingOrder)) function of arrays
export function prioritiseSort (key, _sortingOrder, order = 'asc') {
  /* the sorting order has all possible keys (lowercase) with the index and then it is sorted by the key on the object */

  if (!_sortingOrder || Object.keys(_sortingOrder).length === 0) {
    return (a, b) => a - b; // default sort method
  }

  // change the keys to lowercase
  const keys = Object.keys(_sortingOrder);
  let objKey;
  let n = keys.length - 1;
  const sortingOrder = {};
  while (n >= 0) {
    objKey = keys[n];
    sortingOrder[objKey.toLowerCase()] = _sortingOrder[objKey];
    n -= 1;
  }

  function getShape (layer) {
    if (layer instanceof factory.Marker) {
      return 'Marker';
    }
    if (layer instanceof factory.Circle) {
      return 'Circle';
    }
    if (layer instanceof factory.CircleMarker) {
      return 'CircleMarker';
    }
    if (layer instanceof factory.Rectangle) {
      return 'Rectangle';
    }
    if (layer instanceof factory.Polygon) {
      return 'Polygon';
    }
    if (layer instanceof factory.Polyline) {
      return 'Line';
    }
    return undefined;
  }

  return (a, b) => {
    let keyA;
    let keyB;
    if (key === 'instanceofShape') {
      keyA = getShape(a.layer).toLowerCase();
      keyB = getShape(b.layer).toLowerCase();
      if (!keyA || !keyB) return 0;
    } else {
      /* eslint-disable-next-line no-prototype-builtins */
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
      keyA = a[key].toLowerCase();
      keyB = b[key].toLowerCase();
    }

    const first =
      keyA in sortingOrder ? sortingOrder[keyA] : Number.MAX_SAFE_INTEGER;

    const second =
      keyB in sortingOrder ? sortingOrder[keyB] : Number.MAX_SAFE_INTEGER;

    let result = 0;
    if (first < second) result = -1;
    else if (first > second) result = 1;
    return order === 'desc' ? result * -1 : result;
  };
}
