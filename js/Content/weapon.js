window.WeaponTypes = {
    normal: 'обычное',
    hard: 'усиленное',
    epic: 'эпичное',
    legendary: 'легендарное',
}

window.Weapons = {
    'w001': {
        name: 'Мышка',
        description: 'опасная мышь',
        type: WeaponTypes.normal,
        src: 'images/characters/weapons/w001.png',
        icon: 'images/characters/weapons/normal_ico.png',
        actions: [ 'unfriendly_fire1', 'mouse_damage1', 'mouse_damage2', 'mouse_damage3' ],
    },
    'w002': {
        name: 'Клавиатура',
        description: 'опасная клава',
        type: WeaponTypes.hard,
        src: 'images/characters/weapons/w002.png',
        icon: 'images/characters/weapons/hard_ico.png',
        actions: [ 'mouse_damage3', 'damage3' ],
    },
    'w003': {
        name: 'Заявление на отпуск',
        description: 'опасный листок',
        type: WeaponTypes.epic,
        src: 'images/characters/weapons/w001.png',
        icon: 'images/characters/weapons/epic_ico.png',
        actions: [ 'damage1' ],
    },
    'w004': {
        name: 'Заявление на увольнение lvl 2',
        description: 'опасный листочек',
        type: WeaponTypes.legendary,
        src: 'images/characters/weapons/w001.png',
        icon: 'images/characters/weapons/legendary_ico.png',
        actions: [ 'damage3' ],
    },

}