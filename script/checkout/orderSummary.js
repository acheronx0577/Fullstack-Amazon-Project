import {cart, removeFromCart, updateDeliveryOption} from '../../data/cart.js';
import { products } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import {hello} from 'https://unpkg.com/supersimpledev@1.0.1/hello.esm.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {deliveryOptions} from '../../data/deliveryOptions.js'

hello();

// Delivery options HTML function
function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';
    
    deliveryOptions.forEach((deliveryOption) => { 
        const today = dayjs();
        const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
        const dateString = deliveryDate.format('dddd, MMMM D');
        const priceString = deliveryOption.priceCents === 0
            ? 'Free'
            : `$${formatCurrency(deliveryOption.priceCents)} -`;

        const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

        html += `
            <div class="delivery-option js-delivery-option"
                data-product-id="${matchingProduct.id}"
                data-delivery-option-id="${deliveryOption.id}">
                <input type="radio"
                    ${isChecked ? 'checked' : ''}
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                <div>
                    <div class="delivery-option-date">${dateString}</div>
                    <div class="delivery-option-price">${priceString} Shipping</div>
                </div>
            </div>
        `;
    });
    
    return html;
}

export function renderOrderSummary() {
    // Clean cart first - remove any invalid items
    const validCart = cart.filter(cartItem => 
        cartItem && 
        cartItem.productId && 
        typeof cartItem.productId === 'string'
    );

    // If we found invalid items, log them
    if (validCart.length !== cart.length) {
        console.log(`Removed ${cart.length - validCart.length} invalid cart items`);
    }

    let cartSummaryHTML = '';

    validCart.forEach((cartItem) => {
        const productId = cartItem.productId;

        // Find the matching product using find() instead of forEach
        const matchingProduct = products.find(product => product.id === productId);
        
        if (!matchingProduct) {
            console.warn(`Product with ID "${productId}" not found. Skipping item.`);
            return;
        }

        // Find the delivery option
        const deliveryOption = deliveryOptions.find(option => option.id === cartItem.deliveryOptionId);

        // Calculate delivery date
        const today = dayjs();
        const deliveryDate = deliveryOption 
            ? today.add(deliveryOption.deliveryDays, 'days')
            : today;
        
        const dateString = deliveryDate.format('dddd, MMMM D');

        cartSummaryHTML += `
            <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
                <div class="delivery-date">Delivery date: ${dateString}</div>

                <div class="cart-item-details-grid">
                    <img class="product-image" src="${matchingProduct.image}">

                    <div class="cart-item-details">
                        <div class="product-name">${matchingProduct.name}</div>
                        <div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
                        <div class="product-quantity">
                            <span>Quantity: <span class="quantity-label">${cartItem.quantity}</span></span>
                            <span class="update-quantity-link link-primary">Update</span>
                            <span class="delete-quantity-link link-primary js-delete-link" 
                                  data-product-id="${matchingProduct.id}">Delete</span>
                        </div>
                    </div>

                    <div class="delivery-options">
                        <div class="delivery-options-title">Choose a delivery option:</div>
                        ${deliveryOptionsHTML(matchingProduct, cartItem)}
                    </div>
                </div>
            </div>
        `;
    });

    // Update the order summary
    const orderSummaryElement = document.querySelector('.js-order-summary');
    if (orderSummaryElement) {
        orderSummaryElement.innerHTML = cartSummaryHTML;
    }

    // Add delete event listeners
    document.querySelectorAll('.js-delete-link').forEach((link) => {
        link.addEventListener('click', () => {
            const productId = link.dataset.productId;
            removeFromCart(productId);
            
            // Remove the container and re-render
            const container = document.querySelector(`.js-cart-item-container-${productId}`);
            if (container) {
                container.remove();
            }
            
            // Re-render to update the entire page
            renderOrderSummary();
        });
    });

    // Add delivery option event listeners
    document.querySelectorAll('.js-delivery-option').forEach((element) => {
        element.addEventListener('click', () => {
            const {productId, deliveryOptionId} = element.dataset;
            
            if (productId && deliveryOptionId) {
                updateDeliveryOption(productId, deliveryOptionId);
                renderOrderSummary();
            }
        });
    });

    // Update the checkout items count in the header
    updateCheckoutItemsCount();
}

function updateCheckoutItemsCount() {
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const itemsCountElement = document.querySelector('.js-checkout-items-count');
    
    if (itemsCountElement) {
        itemsCountElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }
}