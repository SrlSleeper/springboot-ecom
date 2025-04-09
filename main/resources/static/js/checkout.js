/**
 * Checkout functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Shipping address same as billing address checkbox
  const sameAddressCheckbox = document.getElementById("same-address")
  if (sameAddressCheckbox) {
    sameAddressCheckbox.addEventListener("change", function () {
      const shippingAddressFields = document.getElementById("shipping-address-fields")
      if (shippingAddressFields) {
        shippingAddressFields.style.display = this.checked ? "none" : "block"

        // Toggle required attribute on shipping fields
        const shippingInputs = shippingAddressFields.querySelectorAll("input, select")
        shippingInputs.forEach((input) => {
          input.required = !this.checked
        })
      }
    })

    // Trigger the change event to initialize the form
    sameAddressCheckbox.dispatchEvent(new Event("change"))
  }

  // Payment method selection
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
  if (paymentMethods.length > 0) {
    paymentMethods.forEach((method) => {
      method.addEventListener("change", function () {
        const paymentForms = document.querySelectorAll(".payment-method-form")
        paymentForms.forEach((form) => {
          form.style.display = "none"
        })

        const selectedForm = document.getElementById(`${this.value}-form`)
        if (selectedForm) {
          selectedForm.style.display = "block"
        }
      })
    })

    // Show the default payment method form
    const defaultMethod = document.querySelector('input[name="paymentMethod"]:checked')
    if (defaultMethod) {
      defaultMethod.dispatchEvent(new Event("change"))
    }
  }

  // Form submission
  const checkoutForm = document.getElementById("checkout-form")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault()

      if (!checkoutForm.checkValidity()) {
        event.stopPropagation()
        checkoutForm.classList.add("was-validated")
        return
      }

      // Show loading spinner
      const submitButton = checkoutForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'

      // Submit the form
      processCheckout(checkoutForm)
        .then((response) => {
          if (response.success) {
            window.location.href = response.redirectUrl
          } else {
            showToast(response.message || "An error occurred during checkout", "danger")
            submitButton.disabled = false
            submitButton.innerHTML = originalButtonText
          }
        })
        .catch((error) => {
          console.error("Checkout error:", error)
          showToast("An error occurred during checkout", "danger")
          submitButton.disabled = false
          submitButton.innerHTML = originalButtonText
        })
    })
  }
})

/**
 * Process the checkout
 * @param {HTMLFormElement} form - The checkout form
 * @returns {Promise<Object>} - The response from the server
 */
async function processCheckout(form) {
  const formData = new FormData(form)
  const formDataObj = {}

  formData.forEach((value, key) => {
    formDataObj[key] = value
  })

  try {
    const response = await fetch("/api/checkout/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify(formDataObj),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Checkout failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error processing checkout:", error)
    throw error
  }
}

/**
 * Validate credit card number using Luhn algorithm
 * @param {string} cardNumber - The credit card number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateCreditCardNumber(cardNumber) {
  // Remove spaces and dashes
  cardNumber = cardNumber.replace(/[\s-]/g, "")

  // Check if the card number contains only digits
  if (!/^\d+$/.test(cardNumber)) {
    return false
  }

  // Luhn algorithm
  let sum = 0
  let shouldDouble = false

  // Loop through the card number from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cardNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * Format credit card number with spaces
 * @param {HTMLInputElement} input - The input element
 */
function formatCreditCardNumber(input) {
  let value = input.value.replace(/\s+/g, "")

  // Add a space after every 4 digits
  value = value.replace(/(\d{4})/g, "$1 ").trim()

  input.value = value
}

/**
 * Show a toast message
 * @param {string} message - The message to show
 * @param {string} type - The type of toast message (success, danger, warning, info)
 */
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container")

  if (!toastContainer) {
    const container = document.createElement("div")
    container.id = "toast-container"
    container.classList.add("toast-container", "position-fixed", "top-0", "end-0", "p-3")
    document.body.appendChild(container)
  }

  const toast = document.createElement("div")
  toast.classList.add("toast", "align-items-center", "text-white", `bg-${type}`, "border-0")
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `

  document.getElementById("toast-container").appendChild(toast)

  const bsToast = new bootstrap.Toast(toast)
  bsToast.show()

  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
    if (document.getElementById("toast-container").children.length === 0) {
      document.getElementById("toast-container").remove()
    }
  })
}

