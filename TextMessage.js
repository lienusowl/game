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
            <p class='text-message__text'>${this.text}</p>
            <button class='text-message__button'>Далее</button>
        `);

        this.element.querySelector('button').addEventListener('click', () => {
            this.done();
        })
    }

    done () {
        this.element.remove();
        this.onComplete();
    }

    init (container) {
        this.createElement();
        container.appendChild(this.element)
    }
}