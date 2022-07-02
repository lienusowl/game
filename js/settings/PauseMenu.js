class PauseMenu {
    constructor({onComplete}) {
        this.onComplete = onComplete;
    }

    getOptions (pageKey) {

        //Case 1: Show the first page of options
        if (pageKey === "root") {
            const lineupPizzas = playerState.lineup.map(id => {
                const {weaponId} = playerState.weapon[id];
                const base = Weapons[weaponId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                ...lineupPizzas,
                {
                    label: "Сохранить",
                    description: "Сохранить игру",
                    handler: () => {
                        //We'll come back to this...
                    }
                },
                {
                    label: "Закрыть",
                    description: "Закрыть меню",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        //Case 2: Show the options for just one pizza (by id)
        const unequipped = Object.keys(playerState.weapon).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {weaponId} = playerState.weapon[id];
            const base = Weapons[weaponId];
            return {
                label: `Переключить на ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        })

        return [
            ...unequipped,
            {
                label: "Передвинуть вперед",
                description: "Переместить оружие в начало списка",
                handler: () => {
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            },
            {
                label: "Назад",
                description: "Вернуться назад",
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        ];
    }

    createElement () {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu")
        this.element.innerHTML = (`
      <h2>Пауза</h2>
    `)
    }

    close () {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init (container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        await utils.wait(200);

        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }

}