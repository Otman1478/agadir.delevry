let cart = [];
let currentLang = 'en';

const translations = {
    en: {
        title: "Agadir Delivery",
        home: "Home",
        grocery: "Grocery",
        food: "Food",
        clothes: "Clothes",
        cart: "Cart",
        "home-title": "Welcome to Agadir Delivery",
        "home-desc": "Fast delivery of groceries, food, and clothes right to your door in Agadir!",
        "add-to-cart": "Add to Cart",
        "remove-from-cart": "Remove",
        total: "Total:",
        name: "Your Name",
        phone: "Phone Number",
        location: "Delivery Location",
        "use-location": "Use My Location",
        "place-order": "Place Order",
        footer: "© 2025 Agadir Delivery. All rights reserved.",
        "order-success": "Order Placed Successfully!",
        "order-close": "Close"
    },
    fr: {
        title: "Livraison Agadir",
        home: "Accueil",
        grocery: "Épicerie",
        food: "Nourriture",
        clothes: "Vêtements",
        cart: "Panier",
        "home-title": "Bienvenue chez Livraison Agadir",
        "home-desc": "Livraison rapide de produits d'épicerie, de nourriture et de vêtements directement à votre porte à Agadir !",
        "add-to-cart": "Ajouter au panier",
        "remove-from-cart": "Supprimer",
        total: "Total :",
        name: "Votre nom",
        phone: "Numéro de téléphone",
        location: "Lieu de livraison",
        "use-location": "Utiliser ma position",
        "place-order": "Passer la commande",
        footer: "© 2025 Livraison Agadir. Tous droits réservés.",
        "order-success": "Commande passée avec succès !",
        "order-close": "Fermer"
    },
    ar: {
        title: "توصيل أكادير",
        home: "الرئيسية",
        grocery: "بقالة",
        food: "طعام",
        clothes: "ملابس",
        cart: "سلة التسوق",
        "home-title": "مرحبًا بكم في توصيل أكادير",
        "home-desc": "توصيل سريع للبقالة والطعام والملابس إلى باب منزلك في أكادير!",
        "add-to-cart": "أضف إلى السلة",
        "remove-from-cart": "إزالة",
        total: "المجموع:",
        name: "اسمك",
        phone: "رقم الهاتف",
        location: "موقع التوصيل",
        "use-location": "استخدام موقعي",
        "place-order": "تقديم الطلب",
        footer: "© 2025 توصيل أكادير. جميع الحقوق محفوظة.",
        "order-success": "تم تقديم الطلب بنجاح!",
        "order-close": "إغلاق"
    }
};

function changeLanguage(lang) {
    currentLang = lang;
    document.body.classList.toggle('rtl', lang === 'ar');
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(input => {
        const key = input.getAttribute('data-lang-placeholder');
        input.placeholder = translations[lang][key];
    });
    loadProducts();
    updateCart();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'cart') updateCart();
}

function addToCart(name, price, img) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }
    updateCartCount();
    showNotification(`${name} ${translations[currentLang]['add-to-cart']}`);
}

function removeFromCart(name) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
        updateCartCount();
        updateCart();
        showNotification(`${name} ${translations[currentLang]['remove-from-cart']}`);
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <span>${item.name} (x${item.quantity})</span>
            <span>${itemTotal} DH</span>
            <button class="remove-btn" onclick="removeFromCart('${item.name}')">${translations[currentLang]['remove-from-cart']}</button>
        `;
        cartItems.appendChild(div);
    });

    document.getElementById('cart-total').textContent = total;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2500);
}

function showOrderConfirmation(name, phone) {
    const confirmation = document.getElementById('order-confirmation');
    confirmation.innerHTML = `
        <p>${translations[currentLang]['order-success']}</p>
        <p>${translations[currentLang].name}: ${name}</p>
        <p>${translations[currentLang].phone}: ${phone}</p>
        <button onclick="document.getElementById('order-confirmation').style.display='none'">${translations[currentLang]['order-close']}</button>
    `;
    confirmation.style.display = 'block';
}

function getUserLocation() {
    const locationBtn = document.getElementById('location-btn');
    locationBtn.classList.add('loading');
    locationBtn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.display_name) {
                            const address = data.display_name;
                            document.getElementById('location').value = address.includes('Agadir') ? address : 'Please enter an Agadir address';
                        } else {
                            alert('Unable to fetch address. Please enter manually.');
                        }
                        locationBtn.classList.remove('loading');
                        locationBtn.disabled = false;
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        alert('Unable to fetch address. Please enter manually.');
                        locationBtn.classList.remove('loading');
                        locationBtn.disabled = false;
                    });
            },
            (error) => {
                alert('Location access denied or unavailable. Please enter your address manually.');
                locationBtn.classList.remove('loading');
                locationBtn.disabled = false;
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
        locationBtn.classList.remove('loading');
        locationBtn.disabled = false;
    }
}

function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const grocery = document.getElementById('grocery-products');
            const food = document.getElementById('food-products');
            const clothes = document.getElementById('clothes-products');
            grocery.innerHTML = '';
            food.innerHTML = '';
            clothes.innerHTML = '';

            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product';
                div.setAttribute('data-img', product.image);
                div.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.price} DH</p>
                    <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')" data-lang="add-to-cart">${translations[currentLang]['add-to-cart']}</button>
                `;
                if (product.category === 'grocery') grocery.appendChild(div);
                else if (product.category === 'food') food.appendChild(div);
                else if (product.category === 'clothes') clothes.appendChild(div);
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const order = {
        name,
        phone,
        location,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showOrderConfirmation(name, phone);
            cart = [];
            updateCartCount();
            updateCart();
            this.reset();
        } else {
            alert('Error submitting order!');
        }
    })
    .catch(error => console.error('Error submitting order:', error));
});

changeLanguage('en');
loadProducts();
showPage('home');