/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер
 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

let xPos = 0;
let yPos = 0;
let currentPos;
let width = screen.width;
let height = screen.height;

document.addEventListener('mousemove', (e) => {
    if(currentPos) {
        currentPos.style.top = `${e.clientY - yPos}px`;
        currentPos.style.left = `${e.clientX - xPos}px`;
    }
});

function random(from, to) {
    return Math.round(Math.random() * (to - from) + from);
}

export function createDiv() {
    let maxColor = 0xffffff;
    let newDiv = document.createElement("div");
    newDiv.style.height = `${random(1, 100)}px`;
    newDiv.style.width = `${random(1, 100)}px`;
    newDiv.style.backgroundColor = '#' + random(0, maxColor).toString(16);
    newDiv.className = 'draggable-div';
    newDiv.style.top = `${random(1, height)}px`;
    newDiv.style.left = `${random(1, width)}px`;
    newDiv.addEventListener('mousedown', (e) => {
        currentPos = newDiv;
        xPos = e.offsetX;
        yPos = e.offsetY;
    })
    newDiv.addEventListener('mouseup', () => (currentPos = false));
    return newDiv;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
    let div = createDiv();
    homeworkContainer.appendChild(div);
});
