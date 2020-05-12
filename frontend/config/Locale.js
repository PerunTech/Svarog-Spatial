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

export const getDrawTooltips = type => {
    const tooltips = {
        "placeMarker": "Click to place marker",
        "firstVertex": "Click to place first vertex",
        "continueLine": "Click to continue drawing",
        "finishLine": "Click any existing marker to finish",
        "finishPoly": "Click first marker to finish",
        "finishRect": "Click to finish",
        "startCircle": "Click to place circle center",
        "finishCircle": "Click to finish circle",
        "placeCircleMarker": "Click to place circle marker"
    };

    return tooltips[type] || '';
}