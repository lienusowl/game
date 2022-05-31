class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    textMessage(resolve) {

        const text = this.event.text
            .replace("{CASTER}", this.event.caster?.name)
            .replace("{TARGET}", this.event.target?.name)
            .replace("{ACTION}", this.event.action?.name)

        const message = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            }
        })
        message.init( this.battle.element )
    }

    async stateChange(resolve) {
        const {caster, target, damage, recover, status, action} = this.event;
        let who = this.event.onCaster ? caster : target;

        if (damage) {
            //modify the target to have less HP
            target.update({
                hp: target.hp - damage
            })

            //start blinking
            target.weaponElement.classList.add("battle-damage-blink");
        }

        if (recover) {
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }
            who.update({
                hp: newHp
            })
        }

        if (status) {
            who.update({
                status: {...status}
            })
        }
        if (status === null) {
            who.update({
                status: null
            })
        }


        //Wait a little bit
        await utils.wait(600)

        //stop blinking
        target.weaponElement.classList.remove("battle-damage-blink");
        resolve();
    }

    submissionMenu(resolve) {
        const {caster} = this.event;
        const menu = new SubmissionMenu({
            caster: this.event.caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            replacements: Object.values(this.battle.combatant).filter(c => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0;
            }),
            onComplete: submission => {
                //submission { what move to use, who to use it on }
                resolve(submission)
            }
        })
        menu.init( this.battle.element )
    }

    async replace (resolve) {
        const {replacement} = this.event;

        // уберем старого бойца
        const prevCombatant = this.battle.combatant[this.battle.activeCombatants[replacement.team]];
        this.battle.activeCombatants[replacement.team] = null;
        prevCombatant.update();
        await utils.wait(500);

        this.battle.activeCombatants[replacement.team] = replacement.id;
        replacement.update();
        await utils.wait(500);

        resolve();
    }

    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }

    init(resolve) {
        this[this.event.type](resolve);
    }
}