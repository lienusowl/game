class TextMessage {
    constructor({ text, onComplete }) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement () {
        // создадим элемент
        this.element = document.createElement('div');
        this.element.classList.add('text-message');

        this.element.innerHTML = (`
            <p class='text-message__text'></p>
            <button class='text-message__button'>Далее</button>
        `);

        // собираемся включить эффект набора текста
        this.revealingText = new RevealingText({
            element: this.element.querySelector(".text-message__text"),
            text: this.text
        })

        this.element.querySelector("button").addEventListener("click", () => {
            this.done();
        });

        this.actionListener = new KeyPressListener("Enter", () => {
            this.done();
        })
    }

    done () {
        if (this.revealingText.isDone) {
            this.element.remove();
            this.actionListener.unbind();
            this.onComplete();
        } else {
            this.revealingText.warpToDone();
        }
    }

    init (container) {
        this.createElement();
        container.appendChild(this.element);
        this.revealingText.init();
    }
}