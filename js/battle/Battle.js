class Battle {
    constructor({ enemy, onComplete }) {

        this.enemy = enemy;
        this.onComplete = onComplete;


        this.combatant = {
            // 'player1': new Combatant({
            //     ...Weapons.w001,
            //     team: 'player',
            //     hp: 30,
            //     maxHp: 50,
            //     xp: 95,
            //     maxXp: 100,
            //     level: 1,
            //     status: { type : 'hard' },
            //     isPlayerControlled: true,
            // }, this),
            // 'player2': new Combatant({
            //     ...Weapons.w002,
            //     team: 'player',
            //     hp: 30,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            //     isPlayerControlled: true,
            // }, this),
            // 'enemy1': new Combatant({
            //     ...Weapons.w002,
            //     team: 'enemy',
            //     hp: 1,
            //     maxHp: 50,
            //     xp: 20,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            // }, this),
            // 'enemy2': new Combatant({
            //     ...Weapons.w002,
            //     team: 'enemy',
            //     hp: 20,
            //     maxHp: 50,
            //     xp: 30,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            // }, this),
        }

        this.activeCombatants = {
            player: null, //'player1',
            enemy: null, //'enemy1',
        }

        window.playerState.lineup.forEach(id => {
            this.addCombatant(id, 'player', window.playerState.weapon[id]);
        });


        Object.keys(this.enemy.weapons).forEach(key => {
            this.addCombatant("e_"+key, 'enemy', this.enemy.weapons[key]);
        });

        this.items = [];

        window.playerState.items.forEach(item => {
            this.items.push({
                ...item,
                team: 'player'
            })
        })

        this.usedInstanceIds = {};
    }

    addCombatant(id, team, config) {
        this.combatant[id] = new Combatant({
            ...Weapons[config.weaponId],
            ...config,
            team,
            isPlayerControlled: team === "player"
        }, this)

        this.activeCombatants[team] = this.activeCombatants[team] || id
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Battle");
        this.element.innerHTML = (`
    <div class="Battle_hero">
      <img src="${'/images/characters/people/lienusowl.png'}" alt="Hero" />
    </div>
    <div class="Battle_enemy">
      <img src=${this.enemy.src} alt=${this.enemy.name} />
    </div>
    `)
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.playerTeam = new Team("player", "Hero");
        this.enemyTeam = new Team("enemy", "Bully");

        Object.keys(this.combatant).forEach(key => {
            let combatant = this.combatant[key];
            combatant.id = key;
            combatant.init(this.element)

            //Add to correct team
            if (combatant.team === "player") {
                this.playerTeam.combatants.push(combatant);
            } else if (combatant.team === "enemy") {
                this.enemyTeam.combatants.push(combatant);
            }
        })

        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this)
                    battleEvent.init(resolve);
                })
            },
            onWinner: winner => {

                if (winner === "player") {
                    const playerState = window.playerState;
                    Object.keys(playerState.weapon).forEach(id => {
                        const playerStateWeapon = playerState.weapon[id];
                        const combatant = this.combatant[id];
                        if (combatant) {
                            playerStateWeapon.hp = combatant.hp;
                            playerStateWeapon.xp = combatant.xp;
                            playerStateWeapon.maxXp = combatant.maxXp;
                            playerStateWeapon.level = combatant.level;
                        }
                    });

                    playerState.items = playerState.items.filter(item => {
                        return !this.usedInstanceIds[item.instanceId]
                    });

                    utils.emitEvent("PlayerStateUpdated");
                }

                this.element.remove();
                this.onComplete();
            }
        });

        this.turnCycle.init();
    }
}