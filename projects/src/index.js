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

document.addEventListener('mousemove', (e) => {
    if(currentPos) {
        currentPos.style.top = `${e.clientY - yPos}px`;
        currentPos.style.left = `${e.clientX - xPos}px`;
    }
});

export function createDiv() {
    let newDiv = document.createElement("div");
    newDiv.style.height = `${(Math.random() * 100)}px`;
    newDiv.style.width = `${(Math.random() * 100)}px`;
    newDiv.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255} )`;
    newDiv.className = 'draggable-div';
    newDiv.style.top = `${(Math.random() * 200)}px`;
    newDiv.style.left = `${(Math.random() * 200)}px`;
    homeworkContainer.appendChild(newDiv);
    newDiv.addEventListener('mousedown', (e) => {
        currentPos = newDiv;
        xPos = e.offsetX;
        yPos = e.offsetY;
    })
    newDiv.addEventListener('mouseup', () => currentPos = false);
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
    createDiv();
});
