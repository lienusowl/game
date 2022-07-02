class PlayerState {
    constructor() {
        this.weapon = {
            "p1": {
                weaponId: "w001",
                hp: 500,
                maxHp: 500,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: { type: "hard" },
            },
            "p2": {
                weaponId: "w002",
                hp: 500,
                maxHp: 500,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null,
            },
            "p3": {
                weaponId: "w003",
                hp: 500,
                maxHp: 500,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null,
            }
        }
        this.lineup = ['p1', 'p2'];
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ];
        this.storyFlags = {
            'DID_SOMETHING': true,
            'DEFEATED_FIRST_BOSS': true,
        }
    }

    swapLineup (oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent("LineupChanged");
    }

    moveToFront (futureFrontId) {
        this.lineup = this.lineup.filter(id => id !== futureFrontId);
        this.lineup.unshift(futureFrontId);
        utils.emitEvent("LineupChanged");
    }
}
window.playerState = new PlayerState();