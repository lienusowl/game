class SubmissionMenu {
    constructor({ caster, enemy, onComplete }) {
        this.caster = caster;
        this.enemy = enemy;
        this.onComplete = onComplete;
    }

    getPages () {

        const backOption = {
            label: 'вернуться назад',
            description: 'Вернуться назад',
            handler: () => {
                this.keyboardMenu.setOptions(this.getPages().root)
            }
        }

        return {
            root: [
                {
                    label: 'Атака',
                    description: 'Выберите атаку',
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getPages().attacks)
                    },

                },
                {
                    label: 'Предметы',
                    description: 'Выберите предметы из инвентаря',
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getPages().items)
                    }
                },
                {
                    label: 'Оружие',
                    description: 'Сменить оружие',
                    handler: () => {

                    }
                },

            ],
            attacks: [
                backOption,
                ...this.caster.actions.map(key => {
                    const action = Actions[key];
                    return {
                        label: action.name,
                        description: action.description,
                        handler: () => {
                            this.menuSubmit(action)
                        }
                    }
                }),
            ],
            items: [
                backOption,

            ]
        }
    }

    menuSubmit(action, instanceId= null) {

        this.keyboardMenu?.end();

        this.onComplete({
            action,
            target: action.targetType === "friendly" ? this.caster : this.enemy
        });
    }

    decide () {
        this.onComplete({
            action: Actions[ this.caster.actions[0] ],
            target: this.enemy
        })
    }

    showMenu (container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions( this.getPages().root )
    }

    init (container) {

        if (this.caster.isPlayerControlled) {
            this.showMenu(container);
        } else {
            this.decide();
        }

        this.decide()
    }
}