"use strict";
import "./css/style.css";



ymaps.ready(init);

function init(){
    // Создание карты.
    let myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 11,

    });
    let storage = localStorage;

    let storageIteration = 0;
    for(let key in storage) {
        storageIteration++;
    }
    storageIteration-=7;

    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: true,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: false,
    })

    function getCoords() {
        let allCoords = [];
        for(let prop in localStorage) {
            if(typeof localStorage[prop] === "string" && (localStorage[prop]) !== 'INFO') {
                let obj = JSON.parse(localStorage[prop]);
                allCoords.push(obj.coords);
            }
        }
        return allCoords;
    }

    const allCoords = getCoords();


    for(let key of allCoords) {
        createPlacemark(key);
    }


    clusterer.events.add('click', (e) => {
        const coords = e.get('target').geometry.getCoordinates();
        onClick(coords);
    })
    myMap.geoObjects.add(clusterer);

    addListeners(myMap);
    document.body.addEventListener("click", onDocumentClick)
    myMap.controls.add('zoomControl');
    myMap.behaviors.disable(['dblClickZoom']);

    let content = document.querySelector('#formTemplate');

    function addListeners(myMap) {
        myMap.events.add("click", (e) => onClick(e.get('coords')));
    }

    function createForm(coords, reviews) {
        let flag = 0;
        for(let prop of reviews) {
            if(prop.coords[0] === coords[0] && prop.coords[1] === coords[1]) flag = 1;
        }
        const formTemplate = document.querySelector('#formTemplate').innerHTML;
        const form = document.createElement('div');
        form.innerHTML = formTemplate;
        const reviewList = form.querySelector('.review-list');
        const reviewForm = form.querySelector('[data-role=review-form]');
        reviewForm.dataset.coords = JSON.stringify(coords);
        form.className = "formBalloon";
        if(flag === 1) {
            for (const item of reviews) {
                const div = document.createElement('div');
                div.classList.add('review-item');
                div.innerHTML = `
            <div>
              <b>${item.review.name}</b> [${item.review.place}]
            </div>
            <div>${item.review.text}</div>
            `;
                reviewList.appendChild(div);
            }
        }

        return form;
    }

    function onClick(coords) {
        let coordsReviewsArray = [];
        for(let prop in localStorage) {
            if(typeof localStorage[prop] === "string" && (localStorage[prop]) !== 'INFO') {
                let obj = JSON.parse(localStorage[prop]);
                let checkCoords = obj.coords;
                if(checkCoords[0] === coords[0] && checkCoords[1] === coords[1]) coordsReviewsArray.push(obj);
            }
        }

        const form = createForm(coords, coordsReviewsArray);
        openBalloon(coords, form.innerHTML);
    }

    function openBalloon(coords, content) {
        myMap.balloon.open(coords, content);
    }

    function closeBalloon() {
        myMap.balloon.close();
    }

    function createPlacemark(coords) {
        const placemark = new ymaps.Placemark(coords);
        placemark.events.add('click', (e) => {
            const coords = e.get('target').geometry.getCoordinates();
            onClick(coords);
        })
        clusterer.add(placemark);
    }


    function onDocumentClick(e) {
        if(e.target.dataset.role === 'review-add') {
            storageIteration++;
            const reviewForm = document.querySelector('[data-role=review-form]');
            const coords = JSON.parse(reviewForm.dataset.coords);
            const data = {
                coords,
                review: {
                    name: document.querySelector('[data-role=review-name]').value,
                    place: document.querySelector('[data-role=review-place]').value,
                    text: document.querySelector('[data-role=review-text]').value,
                },
            };
            try {
                localStorage.setItem(`${storageIteration}`, `${JSON.stringify(data)}`);
                createPlacemark(coords);
                closeBalloon();
            } catch (e) {
                const formError = document.querySelector('.form-error');
                formError.innerText = e.message;
            }

        }
    }

}



