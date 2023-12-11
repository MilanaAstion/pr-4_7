'use strict';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");
const restaurantTitle = document.querySelector(".restaurant-title");
const rating = document.querySelector(".rating");
const minPrice = document.querySelector(".price");
const category = document.querySelector(".category");
const inputSearch = document.querySelector(".input-search");
const modalBody = document.querySelector(".modal-body");
const modalPrice = document.querySelector(".modal-pricetag");
const buttonClearCart = document.querySelector(".clear-cart");
const cart = [];

let login = localStorage.getItem("logName");

const getData = async function (url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
    return await response.json();
}

const validName = function (str) {
    const nameReg = /^[a-zA-Z][a-zA-z0-9-_\.]{1,20}$/;
    return nameReg.test(str);
};

function toggleModal() {
    modal.classList.toggle("is-open");
}

function toggleModalAuth() {
    loginInput.style.borderColor = "";
    modalAuth.classList.toggle('is-open');
}

function returnMain() {
    containerPromo.classList.remove("hide");
    restaurants.classList.remove("hide");
    menu.classList.add("hide");
}

function returnRestaurants() {
    cardsMenu.textContent = "";
    containerPromo.classList.add("hide");
    restaurants.classList.add("hide");
    menu.classList.remove("hide");
}

function authorized() {
    function logOut() {
        login = null;
        localStorage.removeItem("logName");

        buttonAuth.style.display = "";
        userName.style.display = "";
        buttonOut.style.display = "";
        cartButton.style.display = "flex";
        buttonOut.removeEventListener("click", logOut);
        checkAuth();
        returnMain();
    }

    console.log("Авторизован");

    userName.textContent = login;

    buttonAuth.style.display = "none";
    userName.style.display = "inline";
    buttonOut.style.display = "flex";
    cartButton.style.display = "flex";
    

    buttonOut.addEventListener("click", logOut);
}

function notAuthorized() {
    console.log("не авторизован");
    cartButton.style.display = "none";
    function logIn(event) {
        event.preventDefault();
        login = loginInput.value.trim();

        if (!validName(login)) {
            event.preventDefault();
            loginInput.style.borderColor = "red";
        } else {
            localStorage.setItem("logName", login);

            toggleModalAuth();
            buttonAuth.removeEventListener("click", toggleModalAuth);
            closeAuth.removeEventListener("click", toggleModalAuth);
            logInForm.removeEventListener("submit", logIn);
            checkAuth();
        }
    }

    buttonAuth.addEventListener("click", toggleModalAuth);
    closeAuth.addEventListener("click", toggleModalAuth);
    logInForm.addEventListener("submit", logIn);
}

function checkAuth() {
    if (login) {
        authorized();
    } else {
        notAuthorized();
    }
}

function createCardRestaurant({ image, kitchen, name, price, stars, products, time_of_delivery: timeOfDelivery }) {
    const card = document.createElement("a");
    card.className = "card card-restaurant";
    card.products = products;
    card.info = [name, price, stars, kitchen];

    card.insertAdjacentHTML("beforeend", `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title">${name}</h3>
                <span class="card-tag tag">${timeOfDelivery} мин</span>
            </div>
            <div class="card-info">
                <div class="rating">${stars}</div>
                <div class="price">От ${price} ₽</div>
                <div class="category">${kitchen}</div>
            </div>
        </div>
    `);

    cardsRestaurants.insertAdjacentElement("beforeend", card);
}

function createCardGood({ description, image, name, price, id }) {
    const card = document.createElement("div");
    
    card.className = "card";

    card.insertAdjacentHTML("beforeend", `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
            </div>
            <div class="card-info">
                <div class="ingredients">${description}</div>
            </div>
            <div class="card-buttons">
                <button class="button button-primary button-add-cart" id="${id}">
                    <span class="button-card-text">В корзину</span>
                    <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price card-price-bold">${price} ₽</strong>
            </div>
        </div>
    `);

    cardsMenu.insertAdjacentElement("beforeend", card);
}

function openGoods(event) {
    const target = event.target;

    if (login) {
        const restaurant = target.closest(".card-restaurant");

        if (restaurant) {
            const [name, price, stars] = restaurant.info;

            returnRestaurants();

            restaurantTitle.textContent = name;
            rating.textContent = stars;
            minPrice.textContent = `От ${price} Р`;
            category.textContent = "";

            getData(`./db/${restaurant.products}`).then(function (data) {
                data.forEach(createCardGood);
            });
        }
    } else {
        toggleModalAuth();
    }
}

function addToCart(event){
    const target = event.target;
    const buttonAddToCart = target.closest('.button-add-cart');
    if(buttonAddToCart){
        const card = target.closest('.card'); 
        const title = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price-bold').textContent;
        const id = buttonAddToCart.id;

        const food = cart.find(function(item){
            return item.id === id;
        });

        if (food){
            food.count += 1;
        }

        else{
            cart.push({
                id,
                title,
                cost,
                count: 1
            });
        }

        console.log(title, cost, id);
       
        console.log(cart);
    }
}

function renderCart() {
    modalBody.textContent = '';

    // Инициализация общей стоимости
    let totalPrice = 0;

    cart.forEach(function ({ id, title, cost, count }) {
        const itemCart = `
            <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;

        totalPrice += parseFloat(cost) * count;

        modalBody.insertAdjacentHTML('afterbegin', itemCart);
    });

    modalPrice.textContent = totalPrice.toFixed(2); 
}

function changeCount(event) {
    
    const target = event.target;

    if (
        (target.classList.contains("counter-minus") ||
            target.classList.contains("counter-plus")) &&
        target.closest(".food-row")
    ) {
        const foodId = target.closest(".food-row").querySelector(".counter-button").getAttribute("data-id");
        const currentFood = cart.find((item) => item.id === foodId);

        if (currentFood) {
            if (target.classList.contains("counter-minus")) {
                if (currentFood.count > 1) {
                    decreaseCount(currentFood);
                } else {
                    // Optionally remove the item from the cart if the count is 1
                    const itemIndex = cart.findIndex((item) => item.id === foodId);
                    cart.splice(itemIndex, 1);
                }
            } else if (target.classList.contains("counter-plus")) {
                increaseCount(currentFood);
            }

            renderCart();
        } else {
            console.error("Food not found in the cart:", foodId);
        }
    }
}

function increaseCount(food) {
    food.count++;
}

function decreaseCount(food) {
    food.count--;
}


function init() {
    getData("./db/partners.json").then(function (data) {
        data.forEach(createCardRestaurant);
    });

    buttonClearCart.addEventListener("click", function(){
        cart.length = 0;
        renderCart();
    })

    cardsRestaurants.addEventListener("click", openGoods);

    logo.addEventListener("click", returnMain);

    cardsMenu.addEventListener("click", addToCart);

    cartButton.addEventListener("click", function () {
        renderCart();
        toggleModal();
    });

    modalBody.addEventListener("click", changeCount);

    close.addEventListener("click", toggleModal);

    checkAuth();

    new Swiper('.swiper-container', {
        slidesPerView: 1,
        loop: true,
        autoplay: true,
        effect: 'cube',
        grabCursor: true,
        cubeEffect: {
            shadow: false,
        },
    });

    inputSearch.addEventListener("keypress", function (event) {
        if (event.charCode === 13) {
            const value = event.target.value.trim();
            if(!value){
                event.target.style.backgroundColor = "red";
                event.target.value = '';
                setTimeout(function(){
                    event.target.style.backgroundColor = "";
                },1500)
                return;  
            }
            getData('./db/partners.json')
                .then(function (data) {
                    return data.map(function (partner) {
                        return partner.products;
                    });
                })
                .then(function (linksProduct) {
                    cardsMenu.textContent = '';
                    linksProduct.forEach(function (link) {
                        getData(`./db/${link}`)
                            .then(function (data) {

                                const resultSearch = data.filter(function(item){
                                    const name = item.name.toLowerCase();
                                    return name.includes(value.toLowerCase());
                                });

                                containerPromo.classList.add("hide");
                                restaurants.classList.add("hide");
                                menu.classList.remove("hide"); // Fix typo here
                                restaurantTitle.textContent = "Результат поиска:";
                                rating.textContent = "";
                                minPrice.textContent = "";
                                category.textContent = "Разная кухня";
                                resultSearch .forEach(createCardGood);
                            })
                    });
                })
        }
    });
}

init();
