// JavaScript code goes here
const cart = {}; // This object will store our cart items: { 'wear-id': { name: 'wear Name', price: 0.00, quantity: 0 } }
const inventory = { // This object helps us quickly get cake details by ID
    'item00000001': { name: 'Elegant Pink Satin Pajama Set with Lace Trim', price: 79.99 },
    'item00000002': { name: 'Playful Polka Dot Satin Pajama Set with Ruffles', price: 69.99 },
    'item00000003': { name: 'Sweet White Sheer and Satin Short Pajama Set', price: 39.99 },
    'item00000004': { name: 'Classic White Victorian-Inspired Nightgown', price: 49.99 }
    // Add more cakes here, matching the data-id and their name/price
};

const cartItemsList = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const emptyCartMessage = document.getElementById('empty-cart-message');
const checkoutSummaryDiv = document.getElementById('checkout-summary');
const orderDetailsText = document.getElementById('order-details-text');
const finalOrderTotalSpan = document.getElementById('final-order-total');
const copyOrderButton = document.getElementById('copy-order-btn');

// Function to update the cart display on the page
function updateCartDisplay() {
    cartItemsList.innerHTML = ''; // Clear current cart display
    let total = 0;
    let hasItems = false;

    for (const itemId in cart) {
        const item = cart[itemId];
        if (item.quantity > 0) {
            hasItems = true;
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <input type="number" class="cart-item-quantity" data-id="${itemId}" value="${item.quantity}" min="1">
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-item-btn" data-id="${itemId}">Remove</button>
            `;
            cartItemsList.appendChild(listItem);
            total += item.price * item.quantity;
        }
    }

    cartTotalSpan.textContent = `Total: $${total.toFixed(2)}`;

    if (hasItems) {
        emptyCartMessage.style.display = 'none'; // Hide "Your cart is empty" message
        checkoutButton.disabled = false; // Enable checkout button
    } else {
        emptyCartMessage.style.display = 'block'; // Show "Your cart is empty" message
        checkoutButton.disabled = true; // Disable checkout button
    }

    // Add event listeners for quantity changes and remove buttons in the updated cart
    document.querySelectorAll('.cart-item-quantity').forEach(input => {
        input.addEventListener('change', (event) => {
            const itemId = event.target.dataset.id;
            const newQuantity = parseInt(event.target.value);
            if (newQuantity > 0) {
                cart[itemId].quantity = newQuantity;
            } else {
                delete cart[itemId]; // Remove item if quantity goes to 0
            }
            updateCartDisplay(); // Re-render the cart
        });
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            delete cart[itemId]; // Remove item from cart object
            updateCartDisplay(); // Re-render the cart
        });
    });

    // Hide checkout summary if cart becomes empty
    if (!hasItems) {
        checkoutSummaryDiv.style.display = 'none';
    }
}

// Add event listeners to all "Add to Cart" buttons
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const cakeItem = event.target.closest('.product-item');
        const id = cakeItem.dataset.id;
        const price = parseFloat(cakeItem.dataset.price);
        const name = cakeItem.querySelector('h3').textContent;

        if (cart[id]) {
            cart[id].quantity++;
        } else {
            cart[id] = { name: name, price: price, quantity: 1 };
        }
        updateCartDisplay();
    });
});

// Event listener for the checkout button
checkoutButton.addEventListener('click', () => {
    let orderSummary = "Your Order Details:\n\n";
    let finalTotal = 0;

    const items = [];

    for (const itemId in cart) {
        const item = cart[itemId];
        if (item.quantity > 0) {
            const itemTotal = item.price * item.quantity;
            orderSummary += `${item.name} (x${item.quantity}) - $${item.price.toFixed(2)} each = $${itemTotal.toFixed(2)}\n`;
            finalTotal += itemTotal;
            items.push({
                product: item.name,
                quantity: item.quantity,
                price: item.price
            });
        }
    }
    orderSummary += `\nSubtotal: $${finalTotal.toFixed(2)}`;
    orderSummary += `\n\nTo finalize your order, please email this summary to yourstore@example.com or call us at (123) 456-7890.`;

    orderDetailsText.textContent = orderSummary;
    finalOrderTotalSpan.textContent = `$${finalTotal.toFixed(2)}`;
    checkoutSummaryDiv.style.display = 'block'; // Show the summary
    checkoutButton.scrollIntoView({ behavior: 'smooth' }); // Scroll to the summary

    // 只发一次请求，包含全部商品
    fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
    })
    .then(response => response.json())
    .then(data => {
        alert('Order submitted successfully!');
        // 你可以在这里清空购物车，或者刷新页面
    })
    .catch(error => {
        alert('Order submission failed!');
        console.error(error);
    });
});

// Event listener for copying order details
copyOrderButton.addEventListener('click', () => {
    const textToCopy = orderDetailsText.textContent;
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Order details copied to clipboard! You can now paste it into an email or message.');
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy order details. Please copy manually.');
        });
});

// Initial display update
updateCartDisplay();