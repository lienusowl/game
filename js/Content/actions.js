window.Actions = {
    damage1: {
        name: 'отрыжка с начинкой',
        success: [
            { type: 'textMessage', text: 'отрыжка ИСУСА!!1',},
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: 'animation', animation: 'spin' },
            { type: 'stateChange', damage: 10 },
        ]
    },
    damage2: {
        name: 'звонко пернуть',
        targetType: 'friendly',
        success: [
            { type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            { type: "stateChange", status: { type: "hard", expiresIn: 3 } }
        ]
    },
    damage3: {
        name: 'пернуть с подливой',
        success: [
            { type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", status: { type: "hard", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} бездействие!"},
        ]
    }
}