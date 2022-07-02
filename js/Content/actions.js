window.Actions = {
    mouse_damage1: {
        name: 'Кинуть оружие в противника',
        description: "учти, потеряешь оружие",
        success: [
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 15},
            { type: "stateChange", status: { type: "hard", expiresIn: 1 } },
        ]
    },
    mouse_damage2: {
        name: 'Раскрутить за провод и ударить',
        description: "удар с усилением",
        success: [
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 15},
        ]
    },
    mouse_damage3: {
        name: 'Бесяво покликать',
        description: "кликает противным звуком",
        success: [
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", damage: 5},
        ]
    },
    unfriendly_fire1: {
        name: 'Сказать, что увольняешься',
        description: "Если честно я в шоке, может быть возьмешь отпуск за свой счет?",
        targetType: 'friendly',
        success: [
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", recover: -500, },
            { type: "textMessage", text: "угроза ни к чему не привела"},
            { type: "stateChange", status: { type: "hard", expiresIn: 1 } },
        ]
    },
    item_recoverStatus: {// предметы
        name: 'Успокоиться',
        description: 'Уровень стресса понизится и здоровье восстанавливается',
        targetType: 'friendly',
        success: [
            { type:"textMessage", text: "Чувствуется прилив сил", },
            { type:"stateChange", recover: 200, },
            { type: "stateChange", status: { type: "hard", expiresIn: 3 } },
        ]
    },
    item_recoverHp: {
        name: "Вспомнить мемчик",
        targetType: "Хорошее настроение повышает здоровье",
        success: [
            { type:"textMessage", text: "Чувствуется прилив сил", },
            { type:"stateChange", recover: 50, },

        ]
    },
}