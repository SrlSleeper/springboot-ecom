/**
 * Main JavaScript file for the e-commerce application
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
})

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container")
  if (!toastContainer) {
    // Create toast container if it doesn't exist
    const container = document.createElement("div")
    container.id = "toast-container"
    container.className = "toast-container position-fixed bottom-0 end-0 p-3"
    document.body.appendChild(container)
  }

  // Create toast element
  const toastId = "toast-" + Date.now()
  const toastEl = document.createElement("div")
  toastEl.id = toastId
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`
  toastEl.setAttribute("role", "alert")
  toastEl.setAttribute("aria-live", "assertive")
  toastEl.setAttribute("aria-atomic", "true")

  // Create toast content
  toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `

  // Add toast to container
  document.getElementById("toast-container").appendChild(toastEl)

  // Initialize and show toast
  const toast = new bootstrap.Toast(toastEl, {
    autohide: true,
    delay: 5000,
  })
  toast.show()

  // Remove toast element after it's hidden
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove()
  })
}

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

