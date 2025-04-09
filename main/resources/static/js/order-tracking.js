/**
 * Order tracking functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Order tracking form
  const trackingForm = document.getElementById("order-tracking-form")
  if (trackingForm) {
    trackingForm.addEventListener("submit", (event) => {
      event.preventDefault()

      const orderId = document.getElementById("order-id").value
      const email = document.getElementById("order-email").value

      if (!orderId || !email) {
        showToast("Please enter both order ID and email", "warning")
        return
      }

      // Show loading spinner
      const submitButton = trackingForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Tracking...'

      // Track order
      trackOrder(orderId, email)
        .then((response) => {
          if (response.success) {
            // Display order details
            displayOrderDetails(response.order)
          } else {
            showToast(response.message || "Order not found", "danger")
          }
        })
        .catch((error) => {
          console.error("Error tracking order:", error)
          showToast("An error occurred while tracking the order", "danger")
        })
        .finally(() => {
          submitButton.disabled = false
          submitButton.innerHTML = originalButtonText
        })
    })
  }
})

/**
 * Track an order
 * @param {string} orderId - The order ID
 * @param {string} email - The email associated with the order
 * @returns {Promise<Object>} - The response from the server
 */
async function trackOrder(orderId, email) {
  try {
    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, email }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error tracking order:", error)
    throw error
  }
}

/**
 * Display order details
 * @param {Object} order - The order details
 */
function displayOrderDetails(order) {
  const orderDetailsContainer = document.getElementById("order-details")
  if (!orderDetailsContainer) return

  // Clear previous details
  orderDetailsContainer.innerHTML = ""

  // Create order details HTML
  const orderDetailsHTML = `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Order #${order.id}</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></p>
                        <p><strong>Total Amount:</strong> ${formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Shipping Address:</strong></p>
                        <address>
                            ${order.shippingInfo.recipientName}<br>
                            ${order.shippingInfo.street}<br>
                            ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}<br>
                            ${order.shippingInfo.country}
                        </address>
                    </div>
                </div>
                
                <h6 class="mb-3">Order Items</h6>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="mt-4">
                    <h6 class="mb-3">Order Timeline</h6>
                    <div class="position-relative">
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${getOrderProgressPercentage(order.status)}%" aria-valuenow="${getOrderProgressPercentage(order.status)}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="d-flex justify-content-between mt-3">
                            <div class="text-center">
                                <div class="rounded-circle bg-${order.status === "PENDING" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "success" : "secondary"}" style="width: 20px; height: 20px; margin: 0 auto;"></div>
                                <div class="mt-1">Pending</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-${order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "success" : "secondary"}" style="width: 20px; height: 20px; margin: 0 auto;"></div>
                                <div class="mt-1">Processing</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-${order.status === "SHIPPED" || order.status === "DELIVERED" ? "success" : "secondary"}" style="width: 20px; height: 20px; margin: 0 auto;"></div>
                                <div class="mt-1">Shipped</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-${order.status === "DELIVERED" ? "success" : "secondary"}" style="width: 20px; height: 20px; margin: 0 auto;"></div>
                                <div class="mt-1">Delivered</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

  // Add order details to container
  orderDetailsContainer.innerHTML = orderDetailsHTML

  // Show container
  orderDetailsContainer.style.display = "block"

  // Scroll to order details
  orderDetailsContainer.scrollIntoView({ behavior: "smooth" })
}

/**
 * Get the badge color for an order status
 * @param {string} status - The order status
 * @returns {string} - The badge color
 */
function getStatusBadgeColor(status) {
  switch (status) {
    case "PENDING":
      return "warning"
    case "PROCESSING":
      return "info"
    case "SHIPPED":
      return "primary"
    case "DELIVERED":
      return "success"
    case "CANCELLED":
      return "danger"
    default:
      return "secondary"
  }
}

/**
 * Get the progress percentage for an order status
 * @param {string} status - The order status
 * @returns {number} - The progress percentage
 */
function getOrderProgressPercentage(status) {
  switch (status) {
    case "PENDING":
      return 25
    case "PROCESSING":
      return 50
    case "SHIPPED":
      return 75
    case "DELIVERED":
      return 100
    default:
      return 0
  }
}

/**
 * Show a toast message
 * @param {string} message - The message to show
 * @param {string} type - The type of toast message (success, danger, warning, info)
 */
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container")
  if (!toastContainer) {
    console.warn("Toast container not found")
    return
  }

  const toast = document.createElement("div")
  toast.classList.add("toast", "fade", "show")
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")

  toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type.toUpperCase()}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `

  toastContainer.appendChild(toast)

  // Automatically remove the toast after a few seconds
  setTimeout(() => {
    toast.remove()
  }, 5000)
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

