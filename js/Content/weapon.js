window.WeaponTypes = {
    normal: 'обычное',
    hard: 'усиленное',
    epic: 'эпичное',
    legendary: 'легендарное',
}

window.Weapons = {
    'w001': {
        name: 'Компьютерная мышка',
        type: WeaponTypes.normal,
        src: '/images/characters/weapons/w001.png',
        icon: '/images/characters/weapons/normal_ico.png',
        actions: [ 'damage1', 'damage1' ],
    },
    'w002': {
        name: 'Компьютерная клавиатура',
        type: WeaponTypes.hard,
        src: '/images/characters/weapons/w002.png',
        icon: '/images/characters/weapons/hard_ico.png',
        actions: [ 'damage1' ],
    },
    'w003': {
        name: 'Заявление на отпуск',
        type: WeaponTypes.epic,
        src: '/images/characters/weapons/w001.png',
        icon: '/images/characters/weapons/epic_ico.png',
        actions: [ 'damage1' ],
    },
    'w004': {
        name: 'Заявление на увольнение',
        type: WeaponTypes.legendary,
        src: '/images/characters/weapons/w001.png',
        icon: '/images/characters/weapons/legendary_ico.png',
        actions: [ 'damage1' ],
    },

}