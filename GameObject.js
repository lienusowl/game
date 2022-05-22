class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || 'down';
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || '/images/characters/people/hero.png',
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];

    }

    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y);

        // Если у нас есть поведение, начать после небольшой задержки
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {
    }

    async doBehaviorEvent(map) {

        // Ничего не делать, если есть более важная катсцена или у меня нет конфигурации, чтобы что-то делать.
        if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
            return;
        }

        // Настройка нашего события с соответствующей информацией
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        // Создаем экземпляр события из нашей следующей конфигурации события
        const eventHandler = new OverworldEvent({ map, event: eventConfig });
        await eventHandler.init();

        // Установка следующего события для запуска
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }

        // запускаем по новой
        await this.doBehaviorEvent(map);
    }

}