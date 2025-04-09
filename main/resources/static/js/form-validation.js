/**
 * Form validation script
 */
document.addEventListener("DOMContentLoaded", () => {
  // Get all forms that need validation
  const forms = document.querySelectorAll(".needs-validation")

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add("was-validated")
      },
      false,
    )
  })

  // Password match validation
  const passwordField = document.getElementById("password")
  const confirmPasswordField = document.getElementById("confirmPassword")

  if (passwordField && confirmPasswordField) {
    confirmPasswordField.addEventListener("input", () => {
      validatePasswordMatch()
    })

    passwordField.addEventListener("input", () => {
      if (confirmPasswordField.value) {
        validatePasswordMatch()
      }
    })
  }

  // Email validation
  const emailField = document.getElementById("email")
  if (emailField) {
    emailField.addEventListener("blur", () => {
      validateEmail(emailField)
    })
  }
})

/**
 * Validate password match
 */
function validatePasswordMatch() {
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const confirmPasswordField = document.getElementById("confirmPassword")

  if (password !== confirmPassword) {
    confirmPasswordField.setCustomValidity("Passwords do not match")
    document.getElementById("password-match-feedback").textContent = "Passwords do not match"
  } else {
    confirmPasswordField.setCustomValidity("")
    document.getElementById("password-match-feedback").textContent = ""
  }
}

/**
 * Validate email format
 * @param {HTMLElement} emailField - The email input field
 */
function validateEmail(emailField) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const email = emailField.value

  if (!emailRegex.test(email) && email !== "") {
    emailField.setCustomValidity("Please enter a valid email address")
  } else {
    emailField.setCustomValidity("")
  }
}

/**
 * Check if username/email is available
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} - True if available, false otherwise
 */
async function checkEmailAvailability(email) {
  try {
    const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`)
    const data = await response.json()
    return data.available
  } catch (error) {
    console.error("Error checking email availability:", error)
    return false
  }
}

