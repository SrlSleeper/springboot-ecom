/**
 * User profile functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Edit profile button
  const editProfileBtn = document.getElementById("edit-profile-btn")
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      const profileForm = document.getElementById("profile-form")
      const profileInfo = document.getElementById("profile-info")

      if (profileForm && profileInfo) {
        profileInfo.style.display = "none"
        profileForm.style.display = "block"
      }
    })
  }

  // Cancel edit button
  const cancelEditBtn = document.getElementById("cancel-edit-btn")
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", (event) => {
      event.preventDefault()

      const profileForm = document.getElementById("profile-form")
      const profileInfo = document.getElementById("profile-info")

      if (profileForm && profileInfo) {
        profileForm.style.display = "none"
        profileInfo.style.display = "block"

        // Reset form
        profileForm.reset()
      }
    })
  }

  // Change password form
  const changePasswordForm = document.getElementById("change-password-form")
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (event) => {
      event.preventDefault()

      if (!changePasswordForm.checkValidity()) {
        event.stopPropagation()
        changePasswordForm.classList.add("was-validated")
        return
      }

      const currentPassword = document.getElementById("currentPassword").value
      const newPassword = document.getElementById("newPassword").value
      const confirmPassword = document.getElementById("confirmNewPassword").value

      if (newPassword !== confirmPassword) {
        document.getElementById("confirmNewPassword").setCustomValidity("Passwords do not match")
        changePasswordForm.classList.add("was-validated")
        return
      }

      // Show loading spinner
      const submitButton = changePasswordForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'

      // Submit the form
      changePassword(currentPassword, newPassword)
        .then((response) => {
          if (response.success) {
            showToast("Password changed successfully", "success")
            changePasswordForm.reset()
            changePasswordForm.classList.remove("was-validated")
          } else {
            showToast(response.message || "Failed to change password", "danger")
          }
        })
        .catch((error) => {
          console.error("Error changing password:", error)
          showToast("An error occurred while changing password", "danger")
        })
        .finally(() => {
          submitButton.disabled = false
          submitButton.innerHTML = originalButtonText
        })
    })
  }

  // Address form
  const addressForm = document.getElementById("address-form")
  if (addressForm) {
    addressForm.addEventListener("submit", (event) => {
      event.preventDefault()

      if (!addressForm.checkValidity()) {
        event.stopPropagation()
        addressForm.classList.add("was-validated")
        return
      }

      // Show loading spinner
      const submitButton = addressForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'

      // Get form data
      const formData = new FormData(addressForm)
      const addressData = {}
      formData.forEach((value, key) => {
        addressData[key] = value
      })

      // Submit the form
      updateAddress(addressData)
        .then((response) => {
          if (response.success) {
            showToast("Address updated successfully", "success")

            // Update the address display
            document.getElementById("address-street").textContent = addressData.street
            document.getElementById("address-city").textContent = addressData.city
            document.getElementById("address-state").textContent = addressData.state
            document.getElementById("address-country").textContent = addressData.country
            document.getElementById("address-zipCode").textContent = addressData.zipCode

            // Hide form, show info
            document.getElementById("address-form-container").style.display = "none"
            document.getElementById("address-info").style.display = "block"
          } else {
            showToast(response.message || "Failed to update address", "danger")
          }
        })
        .catch((error) => {
          console.error("Error updating address:", error)
          showToast("An error occurred while updating address", "danger")
        })
        .finally(() => {
          submitButton.disabled = false
          submitButton.innerHTML = originalButtonText
        })
    })
  }
})

/**
 * Change user password
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - The response from the server
 */
async function changePassword(currentPassword, newPassword) {
  try {
    const response = await fetch("/api/user/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

/**
 * Update user address
 * @param {Object} addressData - The address data
 * @returns {Promise<Object>} - The response from the server
 */
async function updateAddress(addressData) {
  try {
    const response = await fetch("/api/user/update-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
      body: JSON.stringify(addressData),
    })

    return await response.json()
  } catch (error) {
    console.error("Error updating address:", error)
    throw error
  }
}

/**
 * Show toast message
 * @param {string} message - The message to show
 * @param {string} type - The type of the message (success, danger, etc.)
 */
function showToast(message, type) {
  const toastContainer = document.getElementById("toast-container")
  if (!toastContainer) {
    console.error("Toast container not found")
    return
  }

  const toast = document.createElement("div")
  toast.classList.add("toast", "fade", "show")
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")
  toast.setAttribute("data-bs-autohide", "true")
  toast.setAttribute("data-bs-delay", "5000")

  toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type === "success" ? "Success" : "Error"}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `

  toastContainer.appendChild(toast)

  // Initialize and show the toast using Bootstrap's Toast API
  const bsToast = new bootstrap.Toast(toast)
  bsToast.show()

  // Remove the toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
  })
}

