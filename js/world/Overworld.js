class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector('.game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.map = null;
    }

    startGameLoop () {
        const step = () => {
            // Чистим канвас в следующий кадр
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Тут будет персонаж которому мы передадим камеру слежения
            const cameraPerson = this.map.gameObjects.hero;

            // обновить все объекты
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            })

            // Рисуем нижний слой
            this.map.drawLowerImage(this.ctx, cameraPerson);

            // Рисуем все игровые объекты между нижним и верхним слоем
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y; // Хитрая сортировочка, чтобы более нижние объекты перекрывали те что выше если стоят рядом
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            });

            // рисуем верхний слой
            this.map.drawUpperImage(this.ctx, cameraPerson);

            requestAnimationFrame(() => {
                step();
            });
        }
        step();
    }

    bindActionInput () {
        new KeyPressListener('Enter', () => {
            // Чекаем если ли с кем потрещать с помощью диалогового окна
            this.map.checkForActionCutscene();
        })
    }

    bindHeroPositionCheck () {
        document.addEventListener('PersonWalkingComplete', e => {
            if (e.detail.whoId === 'hero') {
                // позиция героя изменилась
                this.map.checkForFootstepCutscene()
            }
        })
    }

    startMap(mapConfig) {
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();
    }

    init () {
        console.log('Ура игра запустилась!');

        this.startMap(window.OverworldMaps.PC);

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        this.startGameLoop();

        this.map.startCutscene([
            { type: 'textMessage', text: 'Приветствую'},
            { type: 'textMessage', text: 'К сожалению ты попал сюда'},
            { type: 'textMessage', text: 'Твоя главная задача - уволиться'},
            { type: 'textMessage', text: 'Будет еще несколько вариантов выиграть'},
        ]);


    }
}