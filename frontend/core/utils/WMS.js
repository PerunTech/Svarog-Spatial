/**
 * WMS utilities. 
 * 
 * &nbsp;
 * 
 * @namespace util.wms
 */
export const wms = {
  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
  // be appended at the end. If `uppercase` is `true`, the parameter names will
  // be uppercased (e.g. `'?A=foo&B=bar'`)
  getParamString(obj, existingUrl, uppercase) {
    const params = [];
    for (const i in obj) {
      if (Object.hasOwn(obj, i)) {
        params.push(`${encodeURIComponent(uppercase ? i.toUpperCase() : i)}=${encodeURIComponent(obj[i])}`);
      }
    }
    return ((!existingUrl || !existingUrl.includes('?')) ? '?' : '&') + params.join('&');
  }
}
