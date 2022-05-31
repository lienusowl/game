class TurnCycle {
    constructor({ battle, onNewEvent }) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.currentTeam = "player"; //or "enemy"
    }

    async turn() {
        //Get the caster
        const casterId = this.battle.activeCombatants[this.currentTeam];
        const caster = this.battle.combatant[casterId];
        const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
        const enemy = this.battle.combatant[enemyId];

        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy
        });

        // хотим заменить оружие
        if (submission.replacement) {
            await this.onNewEvent({
                type: 'replace',
                replacement: submission.replacement,
            })
            await this.onNewEvent({
                type: 'textMessage',
                text: `меняем оружие на ${submission.replacement.name}`,
            })
            return;
        }

        if (submission.instanceId) {
            this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);

        for (let i=0; i<resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Check for post events
        //(Do things AFTER your original turn submission)
        const postEvents = caster.getPostEvents();
        for (let i=0; i < postEvents.length; i++ ) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Check for status expire
        const expiredEvent = caster.decrementStatus();
        if (expiredEvent) {
            await this.onNewEvent(expiredEvent)
        }

        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();

    }

    async init() {
        await this.onNewEvent({
          type: "textMessage",
          text: "The battle is starting!"
        })

        //Start the first turn!
        this.turn();

    }

}