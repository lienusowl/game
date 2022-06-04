class Combatant {
    constructor(config, battle) {
        Object.keys(config).forEach(key => {
            this[key] = config[key];
        })
        this.hp = typeof(this.hp) === "undefined" ? this.maxHp : this.hp;
        this.battle = battle;
    }

    get hpPercent () {
        const percent = this.hp / this.maxHp * 100;
        return (percent > 0) ? percent : 0;
    }

    get xpPercent () {
        return this.xp / this.maxXp * 100;
    }

    get isActive() {
        return this.battle?.activeCombatants[this.team] === this.id;
    }

    get givesXp () {
        return this.level * 20;
    }

    createElement () {
        this.hudElement = document.createElement('div');
        this.hudElement.classList.add('Combatant');
        this.hudElement.setAttribute('data-combatant', this.id);
        this.hudElement.setAttribute('data-team', this.team);
        this.hudElement.innerHTML = (`
            <p class="Combatant_name"><span>Оружие:</span>${this.name}</p>
            <p class="Combatant_level"></p>
            <div class="Combatant_character_crop">
                <img class="Combatant_character" src="${this.src}" alt="${this.name}">
            </div>
            <img class="Combatant_type" src="${this.icon}" alt="${this.type}">
            <svg viewBox="0 0 45 3" class="Combatant_life_container">
                <rect x="0" y="0" width="0%" height="1" fill="#eb1b1b"/>
                <rect x="0" y="1" width="0%" height="2" fill="#cc0000"/>
            </svg>
            <svg viewBox="0 0 25 2" class="Combatant_xp_container">
                <rect x="0" y="0" width="0%" height="3" fill="#ffd76a"/>
            </svg>
            <p class="Combatant_status"></p>
        `);

        this.weaponElement = document.createElement("img");
        this.weaponElement.classList.add("Weapon");
        this.weaponElement.setAttribute("src", this.src );
        this.weaponElement.setAttribute("alt", this.name );
        this.weaponElement.setAttribute("data-team", this.team );

        this.hpFills = this.hudElement.querySelectorAll('.Combatant_life_container > rect');
        this.xpFills = this.hudElement.querySelectorAll('.Combatant_xp_container > rect');
    }

    update(changes={}) {
        // обвновим когда прилетят ключики
        Object.keys(changes).forEach(key => {
            this[key] = changes[key]
        });

        // обновим влаги чтоб показать текущее оружие и интерфейс
        this.hudElement.setAttribute("data-active", this.isActive);
        this.weaponElement.setAttribute("data-active", this.isActive);

        // обновим здорове и опыт
        this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`)
        this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`)

        // и выведем текущий уровень
        this.hudElement.querySelector(".Combatant_level").innerText = this.level;

        // обновим статус
        const statusElement = this.hudElement.querySelector('.Combatant_status');
        if (this.status) {
            statusElement.innerHTML = this.status.type;
            statusElement.style.display = 'block';
        } else {
            statusElement.innerHTML = '';
            statusElement.style.display = 'none';
        }

    }

    getReplacedEvents (originalEvents) {
        if (this.status?.type === 'hard' && utils.randomFromArray([true, false, false])) {
            return [
                {type: 'textMessage', text: `${this.name} какое то сообщение`},
            ]
        }
        return originalEvents;
    }

    getPostEvents () {
        if (this.status?.type === 'hard') {
            return [
                { type: 'textMessage', text: 'Здоровье восстановлено', },
                { type: 'stateChange', recover: 15, onCaster: true, },
            ]
        }
        return [];
    }

    decrementStatus () {
        if (this.status?.expiresIn > 0) {
            this.status.expiresIn -= 1;
            if (this.status.expiresIn === 0) {
                this.update({
                    status: null,
                });
                return {
                    type: 'textMessage',
                    text: 'Закончились оборонительные маты, здоровье не будет восстанавливаться',
                }
            }
        }
        return null;
    }

    init (container) {
        this.createElement();

        container.appendChild(this.hudElement);
        container.appendChild(this.weaponElement);
        this.update();
    }

}