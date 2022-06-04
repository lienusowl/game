class TurnCycle {
    constructor({ battle, onNewEvent, onWinner }) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.onWinner = onWinner;
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
            });
            this.nextTurn();
            return;
        }

        if (submission.instanceId) {
            this.battle.usedInstanceIds[submission.instanceId] = true;

            this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId);

        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);

        for (let i=0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        const targetDead = submission.target.hp <= 0;
        if (targetDead) {
            await this.onNewEvent({
                type: 'textMessage', text: `${submission.target.name} проиграл бой`
            });

            if (submission.target.team === "enemy") {

                const playerActiveWeaponId = this.battle.activeCombatants.player;
                const xp = submission.target.givesXp;

                await this.onNewEvent({
                    type: 'textMessage',
                    text: `получено ${xp} опыта`
                });

                await this.onNewEvent({
                    type: "giveXp",
                    xp,
                    combatant: this.battle.combatant[playerActiveWeaponId],
                })
            }

        }

        const winner = this.getWinningTeam();
        if (winner) {
            await this.onNewEvent({
                type: 'textMessage', text: `Победа!!!`
            });

            this.onWinner(winner);

            return;
        }

        if (targetDead) {
            const replacement = await this.onNewEvent({
                type: 'replacementMenu',
                team: submission.target.team,
            })
            await this.onNewEvent({
                type: 'replace', replacement: replacement,
            })
            await this.onNewEvent({
                type: 'textMessage', text: `${replacement.name} смена`
            })
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

        this.nextTurn();

    }

    nextTurn () {
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();
    }

    getWinningTeam () {
        let aliveTeams = {};
        Object.values(this.battle.combatant).forEach(c => {
            if (c.hp > 0) {
                aliveTeams[c.team] = true;
            }
        })
        if (!aliveTeams['player']) {
            return 'enemy';
        }
        if (!aliveTeams['enemy']) {
            return 'player';
        }

        return null;
    }

    async init() {
        await this.onNewEvent({
          type: "textMessage",
          text: `${this.battle.enemy.name} вступает в бой`
        })

        //Start the first turn!
        this.turn();

    }

}