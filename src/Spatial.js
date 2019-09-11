(function () {
    let S = {
        version: '0.0.1',
        test_clue: 'run test page [@ ./dist/test.html] find me in global window.S via browser console'
    }

    window.S = S
})()

export {Util} from './core/Util'
export {Core} from './core/Core'
export {IRender} from './interface/IRender'
export {Proj} from './core/Proj'