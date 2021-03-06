const token = localStorage.getItem('myToken');
const discount = localStorage.getItem('discountPercentage') || 10;
const cartBooks = document.getElementById('cart-books');
const cartQuantity = document.getElementById('cart-quantity');
const cartOptions = document.getElementById('cart-options');
const cartPrices = document.getElementById('cart-prices');
const cartPayButton = document.getElementById('cart-payButton');
const cartTotalPrice = document.getElementById('cart-totalPrice');
const myCartUrlUser = 'http://localhost:4000/bookshop/user-cart';
const myCartCustomer = 'http://localhost:4000/bookshop/customer-cart'
let totalPriceP = document.createElement('p')
totalPriceP.className = "totalPriceP";
let totalQuantityP = document.createElement('p')
totalQuantityP.className = "totalQuantityP"
cartTotalPrice.appendChild(totalPriceP)
cartTotalPrice.appendChild(totalQuantityP);
const isUserLogged = !!localStorage.getItem('myToken')
const allTitlesContainer = document.getElementById('cart-books');
const pricesContainer = document.getElementById('cart-prices');
const quantitiesContainer = document.getElementById('cart-quantity');
const optionsContainer = document.getElementById('cart-options');
let totalPrice = 0, totalQuantity = 0;
let remainingBooks = [];
let customerBooksArr = JSON.parse(localStorage.getItem("customerBooksBefore"))

cartPayButton.addEventListener('click', (event) => {
    event.preventDefault();
    while (cartBooks.children.length > 0)
        cartBooks.removeChild(cartBooks.lastChild)
    while (cartQuantity.children.length > 0)
        cartQuantity.removeChild(cartQuantity.lastChild)
    while (cartOptions.children.length > 0)
        cartOptions.removeChild(cartOptions.lastChild)
    while (cartPrices.children.length > 0)
        cartPrices.removeChild(cartPrices.lastChild)
    totalPriceP.innerHTML = `TOTAL PRICE: 0$`
    totalQuantityP.innerHTML = `TOTAL QUANTITY: 0`;
    alert('Thank You for your Purchase')
    localStorage.removeItem('customerBooksBefore')
    localStorage.setItem("connectedUserBooksLength", 0)
})

const getBooksFromDB = () => {
    if (isUserLogged)
        fetch(myCartUrlUser, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.ok)
                return res.json();
            else
                throw res;
        }).then((resJson) => {
            console.log(resJson)
            const totalBooks = resJson;
            console.log(totalBooks)
            const booksFC = {};
            for (let i = 0; i < totalBooks.length; i++) {
                if (totalBooks[i] == null)
                    continue
                booksFC[totalBooks[i].book.title] = (booksFC[totalBooks[i].book.title] || 0) + 1;
            }
            const booksFCPrices = {};
            for (let i = 0; i < totalBooks.length; i++) {
                if (totalBooks[i] == null)
                    continue
                booksFCPrices[totalBooks[i].book.title] = Math.floor(totalBooks[i].book.price * (100 - discount) / 100);
            }
            console.log(booksFC, booksFCPrices)
            for (let book in booksFC) {
                const bookTitle = document.createElement('div');
                bookTitle.className = "bookTitleInCart";
                bookTitle.innerHTML = book;
                cartBooks.appendChild(bookTitle);
                const bookPrice = document.createElement('div');
                bookPrice.className = "bookPriceInCart";
                cartPrices.appendChild(bookPrice)
                const bookQuantity = document.createElement('div');
                bookQuantity.className = "bookQuantityInCart";
                cartQuantity.appendChild(bookQuantity)
                const bookOptions = document.createElement('div')
                bookOptions.className = "bookOptionsInCart";
                cartOptions.appendChild(bookOptions)
                const bookOptionsPlus = document.createElement('span');
                bookOptionsPlus.className = "bookOptionsPlus";
                bookOptionsPlus.innerHTML = '&#65291'
                bookOptionsPlus.addEventListener('click', (event) => {
                    event.preventDefault();
                    PlusBookToCart(booksFCPrices[book], bookPrice, bookQuantity);
                    updateCartOnDB(allTitlesContainer, quantitiesContainer);
                    localStorage.setItem('connectedUserBooksLength', parseInt(localStorage.getItem('connectedUserBooksLength')) + 1);
                })
                const bookOptionsMinus = document.createElement('span');
                bookOptionsMinus.className = "bookOptionsMinus";
                bookOptionsMinus.innerHTML = '&minus;'
                bookOptionsMinus.addEventListener('click', (event) => {
                    event.preventDefault();
                    MinusBookToCart(booksFCPrices[book], bookPrice, bookQuantity)
                    updateCartOnDB(allTitlesContainer, quantitiesContainer);
                    localStorage.setItem('connectedUserBooksLength', parseInt(localStorage.getItem('connectedUserBooksLength')) - 1);
                })
                const bookOptionsDeleteAll = document.createElement('span');
                bookOptionsDeleteAll.className = "bookOptionsDeleteAll";
                bookOptionsDeleteAll.innerHTML = 'X';
                bookOptionsDeleteAll.addEventListener('click', (event) => {
                    event.preventDefault();
                    DeleteBookInCart(book);
                    updateCartOnDB(allTitlesContainer, quantitiesContainer);
                    localStorage.setItem('connectedUserBooksLength', totalQuantity);
                })
                bookOptions.appendChild(bookOptionsPlus)
                bookOptions.appendChild(bookOptionsMinus)
                bookOptions.appendChild(bookOptionsDeleteAll)
                totalPrice += booksFCPrices[book] * booksFC[book];
                totalQuantity += booksFC[book];

                bookPrice.innerHTML = booksFCPrices[book] * booksFC[book];
                bookQuantity.innerHTML = booksFC[book];
            }

            totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
            totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
        }).catch((err) => {
            console.log(err)
            alert(err)
        })
    else {
        const dataCustomer = { booksAdded: JSON.parse(localStorage.getItem("customerBooksBefore")) }
        console.log(dataCustomer)
        fetch(myCartCustomer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataCustomer)
        }).then((res) => {
            if (res.ok)
                return res.json();
            else
                throw res;
        }).then((resJson) => {
            const totalBooks = resJson;
            let booksFC = {};
            for (let i = 0; i < totalBooks.length; i++) {
                booksFC[totalBooks[i].title] = (booksFC[totalBooks[i].title] || 0) + 1;
            }
            let booksFCPrices = {};
            for (let i = 0; i < totalBooks.length; i++) {
                booksFCPrices[totalBooks[i].title] = totalBooks[i].price;
            }
            for (let book in booksFC) {
                const bookTitle = document.createElement('div');
                bookTitle.className = "bookTitleInCart";
                bookTitle.innerHTML = book;
                cartBooks.appendChild(bookTitle);
                const bookPrice = document.createElement('div');
                bookPrice.className = "bookPriceInCart";
                cartPrices.appendChild(bookPrice)
                const bookQuantity = document.createElement('div');
                bookQuantity.className = "bookQuantityInCart";
                cartQuantity.appendChild(bookQuantity)
                const bookOptions = document.createElement('div')
                bookOptions.className = "bookOptionsInCart";
                cartOptions.appendChild(bookOptions)
                const bookOptionsPlus = document.createElement('span');
                bookOptionsPlus.className = "bookOptionsPlus";
                bookOptionsPlus.innerHTML = '&#65291'
                bookOptionsPlus.addEventListener('click', (event) => {
                    event.preventDefault();
                    PlusBookToCart(booksFCPrices[book], bookPrice, bookQuantity);
                    customerBooksArr.push(book)
                    localStorage.setItem("customerBooksBefore", JSON.stringify(customerBooksArr));
                    booksFC[book]++;
                    totalQuantity = totalQuantity++;
                    totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
                    totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
                })
                const bookOptionsMinus = document.createElement('span');
                bookOptionsMinus.className = "bookOptionsMinus";
                bookOptionsMinus.innerHTML = '&minus;'
                bookOptionsMinus.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (booksFC[book] > 1) {
                        MinusBookToCart(booksFCPrices[book], bookPrice, bookQuantity)
                        for (let i = 0; i < customerBooksArr.length; i++) {
                            if (customerBooksArr[i] === bookTitle.innerHTML) {
                                customerBooksArr = customerBooksArr.slice(0, i).concat(customerBooksArr.slice(i + 1))
                                localStorage.setItem("customerBooksBefore", JSON.stringify(customerBooksArr));
                                break;
                            }
                        }
                        booksFC[book]--;
                        totalQuantity = totalQuantity--;
                        totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
                        totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
                    }
                })
                const bookOptionsDeleteAll = document.createElement('span');
                bookOptionsDeleteAll.className = "bookOptionsDeleteAll";
                bookOptionsDeleteAll.innerHTML = 'X';
                bookOptionsDeleteAll.addEventListener('click', (event) => {
                    event.preventDefault();
                    DeleteBookInCart(book);
                    const length = customerBooksArr.length
                    for (let i = 0; i < length; i++) {
                        if (customerBooksArr[i] === bookTitle.innerHTML) {
                            customerBooksArr = customerBooksArr.slice(0, i).concat(customerBooksArr.slice(i + 1))
                            localStorage.setItem("customerBooksBefore", JSON.stringify(customerBooksArr));
                            console.log(customerBooksArr)
                            i--
                        }
                    }
                    totalPrice = totalPrice - (booksFCPrices[book] * booksFC[book]);
                    totalQuantity = totalQuantity - (booksFC[book]);
                    totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
                    totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
                    booksFC[book] = 0;
                })
                bookOptions.appendChild(bookOptionsPlus)
                bookOptions.appendChild(bookOptionsMinus)
                bookOptions.appendChild(bookOptionsDeleteAll)

                bookPrice.innerHTML = booksFCPrices[book] * booksFC[book];
                bookQuantity.innerHTML = booksFC[book];
                console.log(totalPrice, totalQuantity)
                totalPrice += booksFCPrices[book] * booksFC[book];
                totalQuantity += booksFC[book];
                console.log(totalPrice, totalQuantity)
                totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
                totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
            }
        }).catch((err) => {
            console.log(err)
            alert(err)
        })
    }
    localStorage.setItem("customerBooksBefore", JSON.stringify(customerBooksArr));
    console.log(JSON.parse(localStorage.getItem("customerBooksBefore")))
}
getBooksFromDB();

const PlusBookToCart = (bookPrice, bookPriceDiv, bookQuantityDiv) => {
    bookQuantityDiv.innerHTML = parseInt(bookQuantityDiv.innerHTML) + 1
    bookPriceDiv.innerHTML = parseInt(bookPriceDiv.innerHTML) + bookPrice;
    totalPrice += bookPrice;
    totalQuantity++;
}

const MinusBookToCart = (bookPrice, bookPriceDiv, bookQuantityDiv) => {
    if (bookQuantityDiv.innerHTML > 1) {
        bookQuantityDiv.innerHTML = parseInt(bookQuantityDiv.innerHTML) - 1
        bookPriceDiv.innerHTML = parseInt(bookPriceDiv.innerHTML) - bookPrice;
        totalPrice -= bookPrice;
        totalQuantity--;
    }
}

const DeleteBookInCart = (bookD) => {
    let bookIndexInContainer;
    for (let i = 0; i < allTitlesContainer.children.length; i++) {
        if (allTitlesContainer.children[i].innerHTML === bookD) {
            bookIndexInContainer = i + 1;
            bookQuantityToDecrease = quantitiesContainer.childNodes[bookIndexInContainer].innerHTML;
            bookPriceToDecrease = pricesContainer.childNodes[bookIndexInContainer].innerHTML;
            break;
        }
    }

    allTitlesContainer.removeChild(allTitlesContainer.childNodes[bookIndexInContainer]);
    pricesContainer.removeChild(pricesContainer.childNodes[bookIndexInContainer]);
    quantitiesContainer.removeChild(quantitiesContainer.childNodes[bookIndexInContainer]);
    optionsContainer.removeChild(optionsContainer.childNodes[bookIndexInContainer]);
}

const updateCartOnDB = () => {
    remainingBooks = [];
    for (let i = 0; i < allTitlesContainer.children.length; i++) {
        for (let j = 0; j < (parseInt(quantitiesContainer.childNodes[i + 1].innerHTML)); j++) {
            remainingBooks.push(allTitlesContainer.childNodes[i + 1].innerHTML)
        }
    }
    const data = { ...remainingBooks }
    const url = 'http://localhost:4000/bookshop/user-edit-cart'
    fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.ok)
            return res.json();
        else
            throw new Error(res)
    }).then((resJson) => {
        totalPrice = 0
        totalQuantity = resJson.length;
        for (let bookDoc of resJson) {
            console.log(bookDoc.book)
            totalPrice += Math.floor(bookDoc.book.price * (100 - discount) / 100);
        }
        console.log(totalPrice, totalQuantity)
        totalPriceP.innerHTML = `TOTAL PRICE: ${totalPrice}$`
        totalQuantityP.innerHTML = `TOTAL QUANTITY: ${totalQuantity}`;
    }).catch((err) => {
        console.log(err)
    })
}