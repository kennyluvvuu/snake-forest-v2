export function initGallery() {
  const galleries = document.querySelectorAll('[data-gallery]');
  
  galleries.forEach(container => {
    const mainImage = container.querySelector('#main-image') as HTMLImageElement;
    const prevBtn = container.querySelector('#prev-btn');
    const nextBtn = container.querySelector('#next-btn');
    const thumbnails = container.querySelectorAll('.thumbnail');
    
    const images = Array.from(thumbnails).map(t => (t as HTMLElement).dataset.src || '');
    let currentIndex = 0;

    const updateImage = (index: number) => {
      currentIndex = index;
      if (mainImage && images[currentIndex]) {
        mainImage.src = images[currentIndex];
      }
      
      // Update thumbnails UI
      thumbnails.forEach((thumb, i) => {
        if (i === currentIndex) {
          thumb.classList.add('border-brand-accent', 'scale-95');
          thumb.classList.remove('border-transparent');
        } else {
          thumb.classList.remove('border-brand-accent', 'scale-95');
          thumb.classList.add('border-transparent');
        }
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const nextIdx = (currentIndex - 1 + images.length) % images.length;
        updateImage(nextIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = (currentIndex + 1) % images.length;
        updateImage(nextIdx);
      });
    }

    thumbnails.forEach((thumb, i) => {
      thumb.addEventListener('click', () => updateImage(i));
    });
  });
}

// Initialize on load
initGallery();
// Handle view transitions if needed
document.addEventListener('astro:page-load', initGallery);
