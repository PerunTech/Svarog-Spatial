(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

// class
export { CRS } from './CRS';
export { Factory } from './Factory';
export { Map } from './Map';
export { Projection } from './Proj';

////////////////
///// TEST /////
////////////////

