import { Chart } from "@/components/ui/chart"
/**
 * Admin dashboard functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize DataTables
  // Assuming DataTable and showToast are globally available or imported elsewhere.
  // If not, you'll need to import them or define them here.
  // For example, if using a CDN:
  // <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  // You might also need to define showToast if it's a custom function.

  const tables = document.querySelectorAll(".datatable")
  tables.forEach((table) => {
    new DataTable(table, {
      responsive: true,
      lengthMenu: [10, 25, 50, 100],
      language: {
        search: "Search:",
        lengthMenu: "Show _MENU_ entries",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        paginate: {
          first: "First",
          last: "Last",
          next: "Next",
          previous: "Previous",
        },
      },
    })
  })

  // Delete confirmation
  const deleteButtons = document.querySelectorAll(".delete-btn")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault()

      const itemId = this.getAttribute("data-id")
      const itemType = this.getAttribute("data-type")
      const itemName = this.getAttribute("data-name")

      if (confirm(`Are you sure you want to delete ${itemType} "${itemName}"?`)) {
        deleteItem(itemType, itemId)
          .then((response) => {
            if (response.success) {
              showToast(`${itemType} deleted successfully`, "success")
              // Remove the row from the table
              const row = this.closest("tr")
              if (row) {
                row.remove()
              }
            } else {
              showToast(response.message || `Failed to delete ${itemType}`, "danger")
            }
          })
          .catch((error) => {
            console.error(`Error deleting ${itemType}:`, error)
            showToast(`An error occurred while deleting ${itemType}`, "danger")
          })
      }
    })
  })

  // Product image preview
  const imageInput = document.getElementById("productImage")
  const imagePreview = document.getElementById("imagePreview")

  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader()

        reader.onload = (e) => {
          imagePreview.src = e.target.result
          imagePreview.style.display = "block"
        }

        reader.readAsDataURL(this.files[0])
      }
    })
  }

  // Initialize charts if Chart.js is available
  if (typeof Chart !== "undefined") {
    initSalesChart()
    initProductsChart()
  }
})

/**
 * Delete an item
 * @param {string} itemType - The type of item (product, category, user, etc.)
 * @param {string} itemId - The ID of the item
 * @returns {Promise<Object>} - The response from the server
 */
async function deleteItem(itemType, itemId) {
  try {
    const response = await fetch(`/api/admin/${itemType}/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').getAttribute("content"),
      },
    })

    return await response.json()
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error)
    throw error
  }
}

/**
 * Initialize sales chart
 */
function initSalesChart() {
  const ctx = document.getElementById("salesChart")

  if (!ctx) return

  fetch("/api/admin/stats/sales")
    .then((response) => response.json())
    .then((data) => {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Sales",
              data: data.values,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => "$" + value,
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => "$" + context.parsed.y,
              },
            },
          },
        },
      })
    })
    .catch((error) => console.error("Error loading sales data:", error))
}

/**
 * Initialize products chart
 */
function initProductsChart() {
  const ctx = document.getElementById("productsChart")

  if (!ctx) return

  fetch("/api/admin/stats/products")
    .then((response) => response.json())
    .then((data) => {
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      })
    })
    .catch((error) => console.error("Error loading product data:", error))
}

// Example showToast function (if not already defined)
function showToast(message, type = "info") {
  // Create a toast element
  const toast = document.createElement("div")
  toast.classList.add("toast")
  toast.classList.add(`toast-${type}`)
  toast.textContent = message

  // Add the toast to the document
  document.body.appendChild(toast)

  // Animate the toast in
  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  // Animate the toast out and remove it after a delay
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 500) // Fade out duration
  }, 3000) // Display duration
}

