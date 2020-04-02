export const coordinate = (function () {
    const dmsPattern = `${'00'}° ${'00'}' ${'00'}''`;
    
    const toDMS = coord => {
        const pad = string => {
            const dataArr = Array.from(string).filter(c => '0123456789'.split('').includes(c)),
                len = dataArr.length;
        
            return len >= 2 
                ? dataArr.slice(0, 2).join('') 
                : dataArr.join('') + new Array(2 - len + 1).join('0');
        };
    
        const format = string => {
            const dmsArr = string.split(/[°']/).slice(0, 3),
                d = pad(dmsArr[0]),
                m = pad(dmsArr[1]),
                s = pad(dmsArr[2]);

            return `${d}° ${m}' ${s}''`;
        };
    
        return coord ? format(coord) : dmsPattern;
    };

    const toDD = dms => dms.split(/[°']/).slice(0, 3).map((el, idx) =>
        String(el).replace(/\s/g, '').substr(0,2).concat(idx === 0 ? '.' : '')) // filter whitespace from d/m/s and include only first two digits
        .join(''); // assemble string
    
    const setDMSCursor = e => {
        const _c = e.target.selectionStart,
            dLen = dmsPattern.length,
            tLen = e.target.value.length,
            skipSymbol = i => [2, 6, 10].includes(i) ? i + 2 : i;
    
        window.requestAnimationFrame(() => {
            e.target.selectionStart = dLen < tLen ? skipSymbol(_c) : _c
            e.target.selectionEnd = dLen < tLen ? skipSymbol(_c) : _c
        });
    };

    const mask = (coord, proj) => !proj 
        ? toDMS(coord) 
        : [...coord].filter(c => '0123456789'.split('').includes(c)).join('');

    return {
        mask,
        toDMS,
        toDD,
        setDMSCursor
    };
})();