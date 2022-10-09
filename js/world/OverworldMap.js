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
    StartRoom: {
        lowerSrc: "images/maps/DemoLower.png",
        upperSrc: "images/maps/DemoUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "images/characters/people/lienusowl.png",
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "images/characters/people/npc3.png",
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
                x: utils.withGrid(9),
                y: utils.withGrid(5),
                src: "images/characters/people/npc2.png",
                talking: [
                    {
                        events: [
                            { type: 'textMessage', text: 'эй, не подсматривай пожалуйста', faceHero: 'npcB' },
                            { type: 'textMessage', text: 'мне надо уединиться в этой комнате' },
                            { type: 'textMessage', text: 'иди отсюда' },
                            { who: "hero", type: "walk",  direction: "down" },
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
                        { who: "hero", type: "walk",  direction: "left" },
                        { who: "hero", type: "walk",  direction: "left" },
                        { who: "npcB", type: 'walk', direction: 'left', },
                        { who: "npcB", type: 'walk', direction: 'up', },
                        { who: "npcB", type: 'walk', direction: 'up', },
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        { type: "changeMap", map: "PC_enter" }
                    ]
                }
            ]
        },
        walls: {
            [utils.asGridCoord(7,6)] : true,
            [utils.asGridCoord(8,6)] : true,
            [utils.asGridCoord(7,7)] : true,
            [utils.asGridCoord(8,7)] : true,

            // левая стена
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(0,8)] : true,
            [utils.asGridCoord(0,9)] : true,

            // верхняя стена
            [utils.asGridCoord(1,3)] : true,
            [utils.asGridCoord(2,3)] : true,
            [utils.asGridCoord(3,3)] : true,
            [utils.asGridCoord(4,3)] : true,
            [utils.asGridCoord(5,3)] : true,
            [utils.asGridCoord(6,4)] : true,
            [utils.asGridCoord(8,4)] : true,
            [utils.asGridCoord(9,3)] : true,
            [utils.asGridCoord(10,3)] : true,
            [utils.asGridCoord(11,3)] : true,

            // правая стена
            [utils.asGridCoord(11,3)] : true,
            [utils.asGridCoord(11,4)] : true,
            [utils.asGridCoord(11,5)] : true,
            [utils.asGridCoord(11,6)] : true,
            [utils.asGridCoord(11,7)] : true,
            [utils.asGridCoord(11,8)] : true,
            [utils.asGridCoord(11,9)] : true,

            // нижняя стена
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(3,10)] : true,
            [utils.asGridCoord(4,10)] : true,
            [utils.asGridCoord(5,11)] : true,
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(7,10)] : true,
            [utils.asGridCoord(8,10)] : true,
            [utils.asGridCoord(9,10)] : true,
            [utils.asGridCoord(10,10)] : true,
        }
    },
    PC_enter: {
        lowerSrc: "images/maps/pc_map/01_enter_down.png",
        upperSrc: "images/maps/pc_map/01_enter_up.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(13),
                src: "images/characters/people/lienusowl.png",
            }),
            npcB: new Person({
                x: utils.withGrid(4),
                y: utils.withGrid(4),
                src: "images/characters/people/npc3.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "ты в примитивном центре", faceHero:"npcB" },
                            { type: "textMessage", text: "беги отсюда", faceHero:"npcB" },
                        ]
                    }
                ]
            })
        },
        cutsceneSpaces: {
            [utils.asGridCoord(3,13)]: [
                {
                    events: [
                        { type: "changeMap", map: "StartRoom" }
                    ]
                }
            ]
        },
        walls: {
            // up
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(1,2)] : true,
            [utils.asGridCoord(2,2)] : true,
            [utils.asGridCoord(3,2)] : true,
            [utils.asGridCoord(4,2)] : true,

            //left
            [utils.asGridCoord(0,0)] : true,
            [utils.asGridCoord(0,1)] : true,
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(-1,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(1,6)] : true,
            [utils.asGridCoord(1,7)] : true,
            [utils.asGridCoord(1,8)] : true,
            [utils.asGridCoord(1,9)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(1,11)] : true,
            [utils.asGridCoord(0,12)] : true,

            //right
            [utils.asGridCoord(6,0)] : true,
            [utils.asGridCoord(6,1)] : true,
            [utils.asGridCoord(6,2)] : true,
            [utils.asGridCoord(6,3)] : true,
            [utils.asGridCoord(7,3)] : true,
            [utils.asGridCoord(7,4)] : true,
            [utils.asGridCoord(7,5)] : true,
            [utils.asGridCoord(6,5)] : true,
            [utils.asGridCoord(6,6)] : true,
            [utils.asGridCoord(5,7)] : true,
            [utils.asGridCoord(5,8)] : true,
            [utils.asGridCoord(5,9)] : true,
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(6,11)] : true,
            [utils.asGridCoord(6,12)] : true,

            //down
            [utils.asGridCoord(6,13)] : true,
            [utils.asGridCoord(5,13)] : true,
            [utils.asGridCoord(4,13)] : true,
            [utils.asGridCoord(3,14)] : true,
            [utils.asGridCoord(2,13)] : true,
            [utils.asGridCoord(1,13)] : true,

        }
    },



    PCRoomold: {
        lowerSrc: "images/maps/PC/01_front_door.png",
        upperSrc: "images/maps/PC/01_front_door_up.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(17),
                y: utils.withGrid(48),
                src: "images/characters/people/lienusowl.png",
            }),
            NS: new Person({
                x: utils.withGrid(17),
                y: utils.withGrid(43),
                src: "images/characters/people/NS.png",
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
            [utils.asGridCoord(17,49)]: [
                {
                    events: [
                        { type: "changeMap", map: "StartRoom" }
                    ]
                }
            ]
        },
        walls: {
            [utils.asGridCoord(16,48)] : true,
            [utils.asGridCoord(15,48)] : true,
            [utils.asGridCoord(14,48)] : true,
            [utils.asGridCoord(20,48)] : true,
            [utils.asGridCoord(19,48)] : true,
            [utils.asGridCoord(18,48)] : true,
        }
    },

    test: {
        lowerSrc: "images/maps/pc_map/01_enter_down.png",
        upperSrc: "images/maps/pc_map/01_enter_up.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(13),
                src: "images/characters/people/lienusowl.png",
            }),
            npcB: new Person({
                x: utils.withGrid(4),
                y: utils.withGrid(4),
                src: "images/characters/people/npc3.png",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "ты в примитивном центре", faceHero:"npcB" },
                            { type: "textMessage", text: "беги отсюда", faceHero:"npcB" },
                        ]
                    }
                ]
            })
        },
        cutsceneSpaces: {
            [utils.asGridCoord(3,13)]: [
                {
                    events: [
                        { type: "changeMap", map: "DemoRoom" }
                    ]
                }
            ]
        },
        walls: {
            // up
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(1,2)] : true,
            [utils.asGridCoord(2,2)] : true,
            [utils.asGridCoord(3,2)] : true,
            [utils.asGridCoord(4,2)] : true,

            //left
            [utils.asGridCoord(0,0)] : true,
            [utils.asGridCoord(0,1)] : true,
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(-1,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(1,6)] : true,
            [utils.asGridCoord(1,7)] : true,
            [utils.asGridCoord(1,8)] : true,
            [utils.asGridCoord(1,9)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(1,11)] : true,
            [utils.asGridCoord(0,12)] : true,

            //right
            [utils.asGridCoord(6,0)] : true,
            [utils.asGridCoord(6,1)] : true,
            [utils.asGridCoord(6,2)] : true,
            [utils.asGridCoord(6,3)] : true,
            [utils.asGridCoord(7,3)] : true,
            [utils.asGridCoord(7,4)] : true,
            [utils.asGridCoord(7,5)] : true,
            [utils.asGridCoord(6,5)] : true,
            [utils.asGridCoord(6,6)] : true,
            [utils.asGridCoord(5,7)] : true,
            [utils.asGridCoord(5,8)] : true,
            [utils.asGridCoord(5,9)] : true,
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(6,11)] : true,
            [utils.asGridCoord(6,12)] : true,

            //down
            [utils.asGridCoord(6,13)] : true,
            [utils.asGridCoord(5,13)] : true,
            [utils.asGridCoord(4,13)] : true,
            [utils.asGridCoord(3,14)] : true,
            [utils.asGridCoord(2,13)] : true,
            [utils.asGridCoord(1,13)] : true,

        }
    }
}