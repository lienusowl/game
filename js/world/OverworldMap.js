class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc; // нижний слой

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc; // верхний слой

        this.isCutscenePlaying = false;
        this.isPaused = false;
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

        // Цикл событий синхронизации каждого из них
        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                map: this,
                event: events[i],
            });
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        // После сценок хочу чтоб персонажи уже делали, что им надо по жизни

        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForActionCutscene () {
        const hero = this.gameObjects['hero'];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        })
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events);
        }
    }

    checkForFootstepCutscene () {
        const hero = this.gameObjects['hero'];
        const match = this.cutsceneSpaces[ `${hero.x},${hero.y}`];

        if (!this.isCutscenePlaying && match ) {
            this.startCutscene( match[0].events );
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
    PC: {
        lowerSrc: "/images/maps/PC/pc.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(37),
                y: utils.withGrid(55),
            }),
        },
        cutsceneSpaces: {
            [utils.asGridCoord(21,13)]: [
                {
                    events: [
                        { type: "changeMap", map: "Street" }
                    ]
                }
            ]
        },
    },
    DemoRoom: {
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "/images/characters/people/npc1.png",
                behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 800, },
                    { type: 'walk', direction: 'left', },
                    { type: 'stand', direction: 'up', time: 1200, },
                    { type: 'stand', direction: 'right', time: 800, },
                    { type: 'walk', direction: 'right', },
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
                talking: [
                    {
                        events: [
                            { type: 'textMessage', text: 'Привет, съеби пожалуйста', faceHero: 'npcA' },
                            { type: 'textMessage', text: 'мне надо уединиться в этой комнате' },
                            { who: "npcB", type: 'walk', direction: 'right', },
                            { who: "npcB", type: 'walk', direction: 'right', },
                        ],
                    },
                ]
            })
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,3)]: [
                {
                    events: [
                        { who: "npcB", type: "walk",  direction: "left" },
                        { who: "npcB", type: "walk",  direction: "left" },
                        { who: "npcB", type: "stand",  direction: "up", time: 500 },
                        { type: "textMessage", text:"Всё!"},
                        { type: "textMessage", text:"выходи давай!"},
                        { type: "textMessage", text:"хватит делать эти грязные делишки!"},
                        { who: "npcB", type: "walk",  direction: "right" },
                        { who: "hero", type: "walk",  direction: "down" },
                        { who: "hero", type: "walk",  direction: "down" },
                        { who: "hero", type: "walk",  direction: "left" },
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        { type: "changeMap", map: "PC" }
                    ]
                }
            ]
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
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
            }),
            npcB: new Person({
                x: utils.withGrid(10),
                y: utils.withGrid(8),
                src: "/images/characters/people/npc3.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "You made it! This video is going to be such a good time!", faceHero:"npcB" },
                        ]
                    }
                ]
            })
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        { type: "changeMap", map: "DemoRoom" }
                    ]
                }
            ]
        },
    },


    FrontDoor: {
        lowerSrc: "/images/maps/PC/01_front_door.png",
        upperSrc: "/images/maps/PC/01_front_door_up.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(17),
                y: utils.withGrid(48),
                src: "/images/characters/people/lienusowl.png",
            }),
            NS: new Person({
                x: utils.withGrid(17),
                y: utils.withGrid(43),
                src: "/images/characters/people/NS.png",
                talking: [
                    {
                        required: ['TALKED_TO_NS_FIRST_TIME'],
                        events: [
                            { type: 'textMessage', text: 'ну наконец то ты вернулся, пошли давай', faceHero: 'NS' },
                        ]
                    },
                    {
                        events: [
                            { type: 'textMessage', text: 'Фаталья Персеевна, а где тут туалет?', faceHero: 'NS' },
                            { type: 'textMessage', text: 'по коридору первая дверь слева' },
                            { type: 'textMessage', text: 'если ты нам подойдешь, я проведу для тебя экскурсию по офису' },
                            { type: 'textMessage', text: 'ТОЛЬКО НЕ ИСПОЛЬЗУЙ МНОГО ТУАЛЕТНОЙ БУМАГИ' },
                            { type: 'textMessage', text: 'сделаешь свои дела, возвращайся сюда в кабинет' },
                            { type: "battle",  enemyId: "NS", },
                        ],
                    },
                ]
            }),
        },
        cutsceneSpaces: {
            [utils.asGridCoord(17,47)]: [
                {
                    events: [
                        { who: "NS", type: "walk",  direction: "down" },
                        { who: "NS", type: "walk",  direction: "down" },
                        { who: "NS", type: "walk",  direction: "down" },
                        { who: "NS", type: "stand",  direction: "down", },
                        { type: "battle",  enemyId: "NS", },
                        { type: "textMessage", text:"Здравствуй, молодой студентик, меня зовут Фаталья Персеевна"},
                        { type: "textMessage", text:"Я пригласила, тебя работать в нашу Успешную ИТ компанию"},
                        { type: "textMessage", text:"Пройдем в кабинет Генерального директора для прохождения собеседования"},
                        { type: "textMessage", text:"Следуй за мной и заходи в кабинет"},
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "walk",  direction: "up" },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "stand",  direction: "up", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "walk",  direction: "left" },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                        { who: "NS", type: "stand",  direction: "left", },
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        { type: "changeMap", map: "PC" }
                    ]
                }
            ]
        },
    }
}