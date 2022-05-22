class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector('.game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.map = null;
    }

    startGameLoop () {
        const step = () => {
            // чистим канвас в следующий кадр
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // тут будет персонаж которому мы передадим камеру слежения
            const cameraPerson = this.map.gameObjects.hero;

            // обновить все объекты
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            })

            // рисуем нижний слой
            this.map.drawLowerImage(this.ctx, cameraPerson);

            // рисуем все игровые объекты между нижним и верхним слоем
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y; // хитрая сортировочка, чтобы более нижние объекты перекрывали те что выше если стоят рядом
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

    init () {
        console.log('Ура игра запустилась!');

        this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
        this.map.mountObjects();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        this.startGameLoop();


    }
}