/**
 * Product filtering and sorting functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Filter form
  const filterForm = document.getElementById("filter-form")
  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault()
      applyFilters()
    })

    // Reset filters
    const resetButton = document.getElementById("reset-filters")
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        filterForm.reset()
        applyFilters()
      })
    }

    // Price range slider
    const priceRange = document.getElementById("price-range")
    const minPriceInput = document.getElementById("min-price")
    const maxPriceInput = document.getElementById("max-price")

    if (priceRange && minPriceInput && maxPriceInput) {
      if (typeof noUiSlider !== "undefined") {
        noUiSlider.create(priceRange, {
          start: [Number.parseInt(minPriceInput.value) || 0, Number.parseInt(maxPriceInput.value) || 1000],
          connect: true,
          step: 10,
          range: {
            min: 0,
            max: 1000,
          },
          format: {
            to: (value) => Math.round(value),
            from: (value) => Math.round(value),
          },
        })

        priceRange.noUiSlider.on("update", (values, handle) => {
          const value = values[handle]

          if (handle === 0) {
            minPriceInput.value = value
          } else {
            maxPriceInput.value = value
          }
        })

        minPriceInput.addEventListener("change", function () {
          priceRange.noUiSlider.set([this.value, null])
        })

        maxPriceInput.addEventListener("change", function () {
          priceRange.noUiSlider.set([null, this.value])
        })
      } else {
        console.error("noUiSlider is not defined. Make sure the library is included.")
      }
    }
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sort-select")
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFilters()
    })
  }

  // Category filter
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox")
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      applyFilters()
    })
  })
})

/**
 * Apply filters and sort products
 */
function applyFilters() {
  const filterForm = document.getElementById("filter-form")
  const sortSelect = document.getElementById("sort-select")

  if (!filterForm) return

  // Get form data
  const formData = new FormData(filterForm)
  const params = new URLSearchParams()

  // Add form data to URL params
  formData.forEach((value, key) => {
    if (value) {
      params.append(key, value)
    }
  })

  // Add sort parameter
  if (sortSelect && sortSelect.value) {
    params.append("sort", sortSelect.value)
  }

  // Get selected categories
  const selectedCategories = []
  document.querySelectorAll(".category-checkbox:checked").forEach((checkbox) => {
    selectedCategories.push(checkbox.value)
  })

  if (selectedCategories.length > 0) {
    params.append("categories", selectedCategories.join(","))
  }

  // Redirect to filtered URL
  window.location.href = `/products?${params.toString()}`
}

