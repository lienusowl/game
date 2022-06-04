window.Actions = {
    damage1: {
        name: 'Хлесткий удар, усиленный отрыжкой',
        description: "размашистый удар по попке",
        success: [
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 20},
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", damage: 5},
        ]
    },
    damage2: {
        name: 'Забыть чему учили в универе',
        description: "удар с усилением",
        targetType: 'friendly',
        success: [
            { type: "stateChange", status: { type: "normal", expiresIn: 3 } },
            { type: "stateChange", status: { type: "hard", expiresIn: 3 } },
        ]
    },
    damage3: {
        name: 'Сказать, что увольняешься',
        description: "все в офиге застывают",
        success: [
            { type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            { type: "animation", animation: "glob", color: "#dafd2a" },
        ]
    },
    item_recoverStatus: {// предметы
        name: 'восстановление здоровья',
        description: 'Пришла офигенная идея, здоровье восстанавливается',
        targetType: 'friendly',
        success: [
            { type: "textMessage", text: "{ACTION}!"},
            { type:"stateChange", recover: 1000, },
            { type: "stateChange", status: { type: "hard", expiresIn: 3 } },
        ]
    },
    item_recoverHp: {
        name: "Parmesan",
        targetType: "friendly",
        success: [
            { type:"textMessage", text: "{CASTER} sprinkles on some {ACTION}!", },
            { type:"stateChange", recover: 10, },
            { type:"textMessage", text: "{CASTER} recovers HP!", },
        ]
    },
}