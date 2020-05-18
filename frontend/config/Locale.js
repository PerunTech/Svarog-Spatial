export const getProcessTitle = id => {
    const PROCESS_TITLE = {
        'zoom-in': 'Зголеми размер', 
        'zoom-out': 'Намали размер',
        search: 'Пребарај',
        origin: 'Оди на почеток',
        location: 'Оди на локација',
        view: 'Оди на рамка',
        draw: 'Додај земјоделска парцела',
        edit: 'Промени земјоделска парцела',
        cut: 'Пресечи парцела',
        split: 'Подели парцела',
        merge: 'Спои парцели',
        landscape: 'Додај пејсажни карактеристики',
        length: 'Измери должина',
        area: 'Измери површина',
        angle: 'Измери агол',
        erase: 'Отстрани мерења',
        'finish-shape': 'Затвори форма',
        'delete-last-vertex': 'Отстрани последен вертекс',
        'cancel-draw': 'Откажи'
    }

    return PROCESS_TITLE[id] || '';
};

export const getDrawTooltip = type => {
    const tooltips = {
        'placeMarker': 'Кликнете за да поставите маркер.',
        'firstVertex': 'Кликнете за да го поставите првото теме.',
        'continueLine': 'Додадете темиња за да ја обликувате формата.',
        'finishLine': 'Кликнете на последното поставено теме за да формирате линија.',
        'finishPoly': 'Кликнете на првото поставено теме за да формирате полигон.',
        'finishRect': 'Кликнете за да завршите со цртање.',
        'startCircle': 'Кликнете за да поставите центар на кругот.',
        'finishCircle': 'Кликнете за да формирате круг.',
        'placeCircleMarker': 'Кликнете за да поставите маркер.'
    };

    return tooltips[type] || '';
};