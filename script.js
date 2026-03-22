/* sticky header: scroll reveal and hide on scroll direction*/
(function () {
    const stickyHeader = document.getElementById('sticky-header');
    const hero = document.getElementById('product-hero');

    let lastScrollY = window.scrollY;
    let ticking = false;
    const SCROLL_THRESHOLD = hero ? hero.offsetTop : 400; // show after first fold

    function updateHeader() {
        const currentY = window.scrollY;

        if (currentY > SCROLL_THRESHOLD) {
            // Past the fold — show only when scrolling UP 
            if (currentY < lastScrollY) {
                stickyHeader.classList.add('visible');
            } else {
                // Scrolling down — hide header to not block content
                stickyHeader.classList.remove('visible');
            }
        } else {
            // Above first fold — always hide
            stickyHeader.classList.remove('visible');
        }

        lastScrollY = currentY;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}());


/* image carousel */
(function () {
    const thumbs = Array.from(document.querySelectorAll('.thumb'));
    const mainImage = document.getElementById('mainImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Image source list 
    const images = thumbs.map(t => ({
        src: t.dataset.src,
        label: t.getAttribute('aria-label')
    }));

    let currentIndex = 0;


    // Thumb click handlers
    thumbs.forEach(function (thumb, i) {
        thumb.addEventListener('click', function () { switchTo(i); });
    });

    // Arrow buttons
    prevBtn.addEventListener('click', function () { switchTo(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { switchTo(currentIndex + 1); });

    // Keyboard navigation on arrows
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') switchTo(currentIndex - 1);
        if (e.key === 'ArrowRight') switchTo(currentIndex + 1);
    });

    // pauses on hover
    let autoTimer;
    function startAuto() {
        autoTimer = setInterval(function () { switchTo(currentIndex + 1); }, 5000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    const carouselMain = document.getElementById('carouselMain');
    carouselMain.addEventListener('mouseenter', stopAuto);
    carouselMain.addEventListener('mouseleave', startAuto);
    startAuto();


    /* zoom on hover*/
    const zoomLens = document.getElementById('zoomLens');
    const zoomResult = document.getElementById('zoomResult');
    const zoomImg = document.getElementById('zoomImg');

    const ZOOM_FACTOR = 3;   // 3× magnification
    const LENS_SIZE = 90;  // px — size of the cursor lens square

    // Keep zoom image source in sync
    zoomImg.src = images[0].src;

   
    function handleZoomMove(e) {
        const rect = carouselMain.getBoundingClientRect();
        const imgW = rect.width;
        const imgH = rect.height;

        // Pointer relative to the main image
        let pX = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
        let pY = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top;

        // Clamp so lens stays inside image
        const halfL = LENS_SIZE / 2;
        pX = Math.max(halfL, Math.min(imgW - halfL, pX));
        pY = Math.max(halfL, Math.min(imgH - halfL, pY));

        // Position lens (centred on cursor)
        zoomLens.style.left = (pX - halfL) + 'px';
        zoomLens.style.top = (pY - halfL) + 'px';
        zoomLens.style.width = LENS_SIZE + 'px';
        zoomLens.style.height = LENS_SIZE + 'px';

        // Zoom result panel dimensions
        const resultW = zoomResult.offsetWidth || 340;
        const resultH = zoomResult.offsetHeight || 340;

        // The zoom image must be ZOOM_FACTOR times larger than the main image
        const zoomImgW = imgW * ZOOM_FACTOR;
        const zoomImgH = imgH * ZOOM_FACTOR;

        zoomImg.style.width = zoomImgW + 'px';
        zoomImg.style.height = zoomImgH + 'px';

        // Percentage position of cursor in main image
        const ratioX = (pX - halfL) / (imgW - LENS_SIZE);
        const ratioY = (pY - halfL) / (imgH - LENS_SIZE);

        // Shift zoom image so the hovered region is centred in the result panel
        const maxShiftX = -(zoomImgW - resultW);
        const maxShiftY = -(zoomImgH - resultH);

        const shiftX = maxShiftX * ratioX;
        const shiftY = maxShiftY * ratioY;

        zoomImg.style.left = shiftX + 'px';
        zoomImg.style.top = shiftY + 'px';
    }

    function showZoom() {
        zoomImg.src = images[currentIndex].src;
        zoomLens.style.opacity = '1';
        zoomResult.style.display = 'block';
        carouselMain.style.cursor = 'zoom-in';
    }

    function hideZoom() {
        zoomLens.style.opacity = '0';
        zoomResult.style.display = 'none';
        carouselMain.style.cursor = '';
    }

    // Only activate zoom on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
        carouselMain.addEventListener('mouseenter', showZoom);
        carouselMain.addEventListener('mouseleave', hideZoom);
        carouselMain.addEventListener('mousemove', handleZoomMove);
    }
}());