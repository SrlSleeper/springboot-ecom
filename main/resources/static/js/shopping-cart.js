/**
 * Shopping cart functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault()
      const productId = this.getAttribute("data-product-id")
      const quantity = document.querySelector(`input[data-product-id="${productId}"]`)?.value || 1
      addToCart(productId, Number.parseInt(quantity))
    })
  })

  // Update quantity buttons
  const quantityInputs = document.querySelectorAll(".cart-quantity-input")
  quantityInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const productId = this.getAttribute("data-product-id")
      const quantity = Number.parseInt(this.value)
      updateCartItemQuantity(productId, quantity)
    })
  })

  // Remove from cart buttons
  const removeButtons = document.querySelectorAll(".remove-from-cart-btn")
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      removeFromCart(productId)
    })
  })
})

/**
 * Add a product to the cart
 * @param {string} productId - The product ID
 * @param {number} quantity - The quantity to add
 */
async function addToCart(productId, quantity = 1) {
  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify({ productId, quantity }),
    })

    if (!response.ok) {
      throw new Error("Failed to add item to cart")
    }

    const data = await response.json()
    updateCartCounter(data.totalItems)
    showToast("Item added to cart successfully", "success")
  } catch (error) {
    console.error("Error adding to cart:", error)
    showToast("Failed to add item to cart", "danger")
  }
}

/**
 * Update the quantity of a cart item
 * @param {string} productId - The product ID
 * @param {number} quantity - The new quantity
 */
async function updateCartItemQuantity(productId, quantity) {
  if (quantity < 1) {
    showToast("Quantity must be at least 1", "warning")
    return
  }

  try {
    const response = await fetch("/api/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify({ productId, quantity }),
    })

    if (!response.ok) {
      throw new Error("Failed to update cart")
    }

    const data = await response.json()
    updateCartUI(data)
    showToast("Cart updated successfully", "success")
  } catch (error) {
    console.error("Error updating cart:", error)
    showToast("Failed to update cart", "danger")
  }
}

/**
 * Remove an item from the cart
 * @param {string} productId - The product ID to remove
 */
async function removeFromCart(productId) {
  try {
    const response = await fetch("/api/cart/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify({ productId }),
    })

    if (!response.ok) {
      throw new Error("Failed to remove item from cart")
    }

    const data = await response.json()

    // Remove the item row from the cart table
    const itemRow = document.querySelector(`tr[data-product-id="${productId}"]`)
    if (itemRow) {
      itemRow.remove()
    }

    updateCartUI(data)
    showToast("Item removed from cart", "success")

    // If cart is empty, refresh the page to show empty cart message
    if (data.totalItems === 0) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (error) {
    console.error("Error removing from cart:", error)
    showToast("Failed to remove item from cart", "danger")
  }
}

/**
 * Update the cart UI with new data
 * @param {Object} cartData - The cart data
 */
function updateCartUI(cartData) {
  // Update subtotal, tax, shipping, and total
  document.getElementById("cart-subtotal").textContent = formatCurrency(cartData.subtotal)
  document.getElementById("cart-tax").textContent = formatCurrency(cartData.tax)
  document.getElementById("cart-shipping").textContent = formatCurrency(cartData.shipping)
  document.getElementById("cart-total").textContent = formatCurrency(cartData.total)

  // Update cart counter
  updateCartCounter(cartData.totalItems)

  // Update item subtotals
  cartData.items.forEach((item) => {
    const subtotalElement = document.querySelector(`td[data-subtotal-id="${item.productId}"]`)
    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(item.subtotal)
    }
  })
}

/**
 * Update the cart counter in the header
 * @param {number} count - The number of items in the cart
 */
function updateCartCounter(count) {
  const cartCounter = document.getElementById("cart-counter")
  if (cartCounter) {
    cartCounter.textContent = count
    cartCounter.style.display = count > 0 ? "inline-block" : "none"
  }
}

/**
 * Show a toast message
 * @param {string} message - The message to show
 * @param {string} type - The type of toast message (success, danger, warning)
 */
function showToast(message, type) {
  // Implement your toast message logic here.
  // This is a placeholder.  You might use a library like Bootstrap's toast component.
  console.log(`Toast: ${message} (${type})`)
  // Example using Bootstrap's toast (requires Bootstrap CSS and JS):
  /*
    const toastContainer = document.getElementById('toast-container'); // Make sure this element exists in your HTML
    const toast = document.createElement('div');
    toast.classList.add('toast', 'bg-' + type, 'text-white');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    */
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

