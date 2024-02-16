const words = 'cat dog house blue jump happy flower sun walk strong apple friendly smile water play kind sleep book tree run sky bright good warm fast quiet sweet small bright big soft warm cold loud fast slow high low happy sad smart funny new old young cold hot wet dry full empty dark light hard soft heavy light short tall fast slow open close far near simple complex clean dirty empty full win lose true false north south east west start stop give take buy sell happy sad up down in out fast slow left right good bad loud quiet high low large small day night'.split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
let timer = null;
let gameStart = null;

function addClass(el, name) {
    el.classList.add(name);
}

function removeClass(el, name) {
    el.classList.remove(name);
}

function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
    document.getElementById('words').innerHTML = '';
    for (let i = 0; i < 200; i++) {
        document.getElementById('words').innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    document.getElementById('info').innerHTML = `${gameTime / 1000}s`;
    timer = null;
}

function getWpm() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex + 1);
    const correctWords = typedWords.filter((word) => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(
            (letter) => letter.classList.contains('incorrect')
        );
        const correctLetters = letters.filter(
            (letter) => letter.classList.contains('correct')
        );
        return (
            incorrectLetters.length === 0 && correctLetters.length === letters.length
        );
    });
    return (correctWords.length / gameTime) * 60000;
}

function gameOver() {
    clearInterval(timer);
    removeClass(document.getElementById('game'), 'over');
    const result = getWpm();
    console.log({ result });
    document.getElementById('info').innerHTML = `WPM: ${result.toFixed(2)}`;
}

document.getElementById('game').addEventListener('keyup', (ev) => {
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerText || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (document.querySelector('#game.over')) {
        return;
    }

    if (!timer && isLetter) {
        timer = setInterval(() => {
            if (!gameStart) {
                gameStart = new Date().getTime();
            }
            const currentTime = new Date().getTime();
            const msPassed = currentTime - gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = (gameTime / 1000) - sPassed;
            if (sLeft <= 0) {
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = `${sLeft}s`;
        }, 1000);
    }

    if (isLetter) {
        if (currentLetter) {
            addClass(
                currentLetter,
                key === expected ? 'correct' : 'incorrect'
            );
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling) {
                addClass(currentLetter.nextSibling, 'current');
            } else {
                // Automatically move to the next line when the word is completed
                removeClass(currentWord, 'current');
                const nextWord = currentWord.nextSibling;
                if (nextWord) {
                    addClass(nextWord, 'current');
                    const nextLetter = nextWord.querySelector('.letter');
                    if (nextLetter) {
                        addClass(nextLetter, 'current');
                    }
                }
            }
        } else {
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }

    if (isBackspace) {
        if (currentLetter && isFirstLetter) {
            removeClass(currentWord, 'current');
            const prevWord = currentWord.previousSibling;
            if (prevWord) {
                addClass(prevWord, 'current');
                const lastLetter = prevWord.querySelector('.letter:last-child');
                if (lastLetter) {
                    addClass(lastLetter, 'current');
                }
            }
        } else if (currentLetter) {
            removeClass(currentLetter, 'current');
            if (currentLetter.previousSibling) {
                addClass(currentLetter.previousSibling, 'current');
            } else {
                const prevWord = currentWord.previousSibling;
                if (prevWord) {
                    removeClass(currentWord, 'current');
                    addClass(prevWord, 'current');
                    const lastLetter = prevWord.querySelector('.letter:last-child');
                    if (lastLetter) {
                        addClass(lastLetter, 'current');
                    }
                }
            }
        }
    }

    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    cursor.style.top =
        (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
    cursor.style.left =
        (nextLetter || nextWord).getBoundingClientRect()[
            nextLetter ? 'left' : 'right'
        ] + 'px';
});

document.getElementById('newGameButton').addEventListener('click', () => {
    gameOver();
    newGame();
});

newGame();
