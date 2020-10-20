/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответствует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

import "./cookie.html";

/*
 app - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');
console.log(homeworkContainer);
console.log(filterNameInput);

let cookie = getCookies();
let filterValue = '';

filterNameInput.addEventListener('input', function () {
    filterValue = this.value;
    tableUpd();
});

tableUpd();

addButton.addEventListener('click', () => {
    document.cookie = `${addNameInput.value}=${addValueInput.value}`;
    tableUpd();
});

listTable.addEventListener('click', (e) => {
    if(e.target.dataset.role === 'delete') {
        const name = `${e.target.dataset.name}`;
        document.cookie = `${name}=value; max-age=0`;
        console.log(document.cookie);
        tableUpd();
    }
});

function getCookies() {
    return document.cookie
        .split('; ')
        .filter(Boolean)
        .reduce((prev, current) => {
            const [name, value] = current.split('=');
            prev[name] = value;
            return prev;
        }, {})
}

function tableUpd() {
    cookie = getCookies();
    listTable.innerHTML = '';
    for(let prop in cookie) {
        if(filterValue &&
            !prop.toLowerCase().includes(filterValue.toLowerCase())
            &&
            !cookie[prop].toLowerCase().includes(filterValue.toLowerCase()))
        {
            continue;
        }
        let fragment = document.createDocumentFragment();
        const tr = document.createElement('tr');
        const CookieNameTD = document.createElement('td');
        const CookieValueTD = document.createElement('td');
        const CookieDeleteTD = document.createElement('td');
        const ButtonTD = document.createElement('button');
        CookieNameTD.textContent = prop;
        CookieValueTD.textContent = cookie[prop];
        ButtonTD.innerHTML = 'Удалить';
        ButtonTD.dataset.name = prop;
        ButtonTD.dataset.role = 'delete';
        tr.appendChild(CookieNameTD);
        tr.appendChild(CookieValueTD);
        tr.appendChild(CookieDeleteTD);
        CookieDeleteTD.appendChild(ButtonTD);
        fragment.append(tr);
        listTable.append(fragment);
    }
}