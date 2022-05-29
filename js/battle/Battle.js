class Battle {
    constructor() {
        this.combatant = {
            'player1': new Combatant({
                ...Weapons.w001,
                team: 'player',
                hp: 30,
                maxHp: 50,
                xp: 75,
                maxXp: 100,
                level: 1,
                status: null,
            }, this),
            'enemy1': new Combatant({
                ...Weapons.w002,
                team: 'enemy',
                hp: 25,
                maxHp: 50,
                xp: 20,
                maxXp: 100,
                level: 1,
                status: null,
            }, this),
            'enemy2': new Combatant({
                ...Weapons.w002,
                team: 'enemy',
                hp: 20,
                maxHp: 50,
                xp: 30,
                maxXp: 100,
                level: 1,
                status: null,
            }, this),
        }
        this.activeCombatants = {
            player: 'player1',
            enemy: 'enemy1',
        }
    }

    createElement () {
        this.element = document.createElement('div');
        this.element.classList.add('Battle');
        this.element.innerHTML = (`
            <div class="Battle_hero">
                <img src="${'/images/characters/people/lienusowl.png'}" alt="hero">
            </div>
            
            <div class="Battle_enemy">
                <img src="${'/images/characters/people/NS.png'}" alt="enemy">
            </div>
        `);
    }

    init (container) {
        this.createElement();
        container.appendChild(this.element);

        Object.keys(this.combatant).forEach(key => {
            let combatant = this.combatant[key];
            combatant.id = key;
            combatant.init(this.element);
        });

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this);
                    battleEvent.init(resolve);
                })
            }
        });

        this.turnCycle.init();
    }
}