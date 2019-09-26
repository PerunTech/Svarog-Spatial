(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

//core - should not be exported
// export { Util } from './core/Util';
// export { Core } from './core/Core';
// export { Interface } from './core/Interface'
// proj
export { projection } from './proj/Proj';
export { crs } from './proj/CRS';
//interface
export { iFactory } from './interface/IFactory';
export { IProj } from './interface/IProj';



////////////////
///// TEST /////
////////////////


