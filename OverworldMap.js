class OverworldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects;
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc; // нижний слой

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc; // верхний слой

        this.isCutscenePlaying = false;
    }

    drawLowerImage (ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
        )
    }

    drawUpperImage (ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
        )
    }

    isSpaceTaken (currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects () {

        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects[key];
            object.id = key;

            //TODO: определить надо ли грузить объект сейчас
            object.mount(this);
        });
    }

    async startCutscene (events) {
        this.isCutscenePlaying = true;

        // цикл событий синхронизации каждого из них
        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                map: this,
                event: events[i],
            });
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        // после сценок хочу чтоб персонажи уже делали, что им надо по жизни

        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));


    }

    checkForActionCutScene () {
        const hero = this.gameObjects['hero'];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        })
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events);
        }
    }

    addWall (x,y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall (x,y) {
        delete this.walls[`${x},${y}`];
    }

    moveWall (wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const {x,y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x,y);
    }


}

window.OverworldMaps = {
    DemoRoom: {
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "/images/characters/people/npc1.png",
                behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 800, },
                    { type: 'stand', direction: 'up', time: 1200, },
                    { type: 'stand', direction: 'right', time: 800, },
                    { type: 'stand', direction: 'down', time: 300, },

                ],
                talking: [
                    {
                        events: [
                            { type: 'textMessage', text: 'Привет, я Алексей из отдела ИТ', faceHero: 'npcA' },
                            { type: 'textMessage', text: 'пишет - connection refused' },
                            { type: 'textMessage', text: 'сукабля' },
                            { type: 'textMessage', text: 'ебаные миграции' },
                        ],
                    },
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(3),
                y: utils.withGrid(7),
                src: "/images/characters/people/npc2.png",
                behaviorLoop: [
                    { type: 'walk', direction: 'left', },
                    { type: 'stand', direction: 'up', time: 800, },
                    { type: 'walk', direction: 'up', },
                    { type: 'walk', direction: 'right', },
                    { type: 'walk', direction: 'down', },
                ]
            })
        },
        walls: {
            [utils.asGridCoord(7,6)] : true,
            [utils.asGridCoord(8,6)] : true,
            [utils.asGridCoord(7,7)] : true,
            [utils.asGridCoord(8,7)] : true,
        }
    },
    Kitchen: {
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        gameObjects: {
            hero: new GameObject({
                x: 3,
                y: 5,
            }),
            npcA: new GameObject({
                x: 9,
                y: 6,
                src: "/images/characters/people/npc2.png"
            }),
            npcB: new GameObject({
                x: 10,
                y: 8,
                src: "/images/characters/people/npc3.png"
            })
        }
    },
}