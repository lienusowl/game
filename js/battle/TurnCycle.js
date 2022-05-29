class TurnCycle {
    constructor({battle, onNewEvent}) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.currentTeam = 'player'; //или противник
    }

    async turn () {
        // чья очередь
        const casterId = this.battle.activeCombatants[this.currentTeam];
        const caster = this.battle.combatant[casterId];

        // получим врага
        const enemyId = this.battle.activeCombatants[caster.team === 'player' ? 'enemy' : 'player'];
        const enemy = this.battle.combatant[enemyId];

        const submission = await this.onNewEvent({
            type: 'submissionMenu',
            caster,
            enemy
        });

        const resultingEvents = caster.getReplaceEvents(submission.action.success);

        for (let i = 0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        // есть ли доп события - делаем что то после начала хода
        const postEvents = caster.getPostEvents();
        for (let i = 0; i < postEvents.length; i++ ) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        // проверим работает ли еще статус
        const expiredEvent = caster.decrementStatus();
        if (expiredEvent) {
            await this.onNewEvent(expiredEvent)
        }

        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();
    }

    async init () {
        await this.onNewEvent({
            type: 'textMessage',
            text: 'Да будет бой!'
        });

        // запускаем ход
        await this.turn();
    }
}