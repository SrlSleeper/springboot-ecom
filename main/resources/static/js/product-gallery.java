/**
 * Product gallery functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.getElementById("main-product-image")
  const thumbnails = document.querySelectorAll(".product-thumbnail")

  if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        // Update main image
        mainImage.src = this.getAttribute("data-large-img")
        mainImage.alt = this.alt

        // Update active thumbnail
        thumbnails.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
      })
    })
  }

  // Initialize zoom effect if available
  if (mainImage) {
    initImageZoom(mainImage)
  }
})

/**
 * Initialize image zoom effect
 * @param {HTMLElement} imageElement - The image element to apply zoom to
 */
function initImageZoom(imageElement) {
  const container = imageElement.parentElement

  container.addEventListener("mouseenter", () => {
    container.style.cursor = "zoom-in"
  })

  container.addEventListener("mouseleave", () => {
    container.style.cursor = "default"
  })

  container.addEventListener("click", () => {
    // Create modal with zoomed image
    const modal = document.createElement("div")
    modal.className = "modal fade"
    modal.id = "imageZoomModal"
    modal.setAttribute("tabindex", "-1")
    modal.setAttribute("aria-labelledby", "imageZoomModalLabel")
    modal.setAttribute("aria-hidden", "true")

    modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="imageZoomModalLabel">${imageElement.alt}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${imageElement.src}" class="img-fluid" alt="${imageElement.alt}">
                    </div>
                </div>
            </div>
        `

    document.body.appendChild(modal)

    const modalObj = new bootstrap.Modal(modal)
    modalObj.show()

    modal.addEventListener("hidden.bs.modal", () => {
      modal.remove()
    })
  })
}

