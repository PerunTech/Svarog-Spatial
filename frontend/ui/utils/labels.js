import { redux } from 'perun-core';

export function getLabel(labelCode) {
  return redux.store.getState().intl.messages[`perun.spatial.${labelCode}`] || `perun.spatial.${labelCode}`
}
