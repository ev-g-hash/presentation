// static/js/presentation.js
let currentSlide = 1;
const totalSlides = 7;

// Touch variables
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (n > totalSlides) currentSlide = 1;
    if (n < 1) currentSlide = totalSlides;
    
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    document.getElementById(`slide${currentSlide}`).classList.add('active');
    indicators[currentSlide - 1].classList.add('active');
    
    document.getElementById('currentSlide').textContent = currentSlide;
    
    // Обновляем состояние кнопок навигации
    document.getElementById('prevBtn').disabled = currentSlide === 1;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides;
    
    // Прокручиваем к началу слайда при смене
    const activeSlide = document.getElementById(`slide${currentSlide}`);
    if (activeSlide) {
        activeSlide.scrollTop = 0;
    }
}

function changeSlide(direction) {
    currentSlide += direction;
    showSlide(currentSlide);
    
    // Добавляем haptic feedback для мобильных устройств
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function goToSlide(slideNumber) {
    currentSlide = slideNumber;
    showSlide(currentSlide);
    
    // Добавляем haptic feedback для мобильных устройств
    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
}

// Touch/swipe handling
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchMove(e) {
    // Не предотвращаем прокрутку внутри слайдов
    const target = e.target;
    if (target.closest('.slide') && target.closest('.slide').scrollHeight > target.closest('.slide').clientHeight) {
        // Разрешаем прокрутку если контент больше высоты
        return;
    }
    e.preventDefault();
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    
    // Проверяем что это именно свайп, а не прокрутка
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right - go to previous slide
            changeSlide(-1);
        } else {
            // Swipe left - go to next slide
            changeSlide(1);
        }
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowLeft':
            changeSlide(-1);
            break;
        case 'ArrowRight':
            changeSlide(1);
            break;
        case 'Home':
            goToSlide(1);
            break;
        case 'End':
            goToSlide(totalSlides);
            break;
        case 'Escape':
            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            break;
    }
});

// Double tap to toggle fullscreen on mobile
let lastTapTime = 0;
function handleDoubleTap() {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        }
    }
    lastTapTime = currentTime;
}

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// УЛУЧШЕННАЯ обработка кнопок для мобильных
function initButtonHandlers() {
    const buttons = document.querySelectorAll('.nav-btn, .indicator');
    
    buttons.forEach(button => {
        // Удаляем старые обработчики
        button.removeEventListener('touchstart', button._touchStartHandler);
        button.removeEventListener('touchend', button._touchEndHandler);
        button.removeEventListener('touchcancel', button._touchCancelHandler);
        
        // Создаем новые обработчики
        button._touchStartHandler = function(e) {
            // Предотвращаем всплытие события
            e.preventDefault();
            e.stopPropagation();
            
            // Добавляем визуальный feedback
            this.style.transform = 'scale(0.95)';
            this.style.background = '#f0f0f0';
        };
        
        button._touchEndHandler = function(e) {
            // Предотвращаем всплытие события
            e.preventDefault();
            e.stopPropagation();
            
            // Возвращаем нормальный вид
            this.style.transform = '';
            this.style.background = '';
            
            // Выполняем действие после небольшой задержки
            setTimeout(() => {
                if (this.onclick) {
                    this.onclick();
                }
            }, 10);
        };
        
        button._touchCancelHandler = function(e) {
            // Предотвращаем всплытие события
            e.preventDefault();
            e.stopPropagation();
            
            // Возвращаем нормальный вид
            this.style.transform = '';
            this.style.background = '';
        };
        
        // Добавляем новые обработчики
        button.addEventListener('touchstart', button._touchStartHandler, { passive: false });
        button.addEventListener('touchend', button._touchEndHandler, { passive: false });
        button.addEventListener('touchcancel', button._touchCancelHandler, { passive: false });
        
        // Добавляем visual feedback для mouse events
        button.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Left mouse button
                this.style.transform = 'scale(0.95)';
                this.style.background = '#f0f0f0';
            }
        });
        
        button.addEventListener('mouseup', function(e) {
            if (e.button === 0) { // Left mouse button
                this.style.transform = '';
                this.style.background = '';
            }
        });
        
        button.addEventListener('mouseleave', function(e) {
            this.style.transform = '';
            this.style.background = '';
        });
    });
}

// УЛУЧШЕННАЯ обработка для мобильных устройств
function initMobileOptimizations() {
    // Отключаем pull-to-refresh только для основного контейнера
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            const target = e.target;
            touchStartY = e.touches[0].clientY;
            
            // Разрешаем прокрутку внутри слайдов
            if (target.closest('.slide') && target.closest('.slide').scrollHeight > target.closest('.slide').clientHeight) {
                return;
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1) {
            const target = e.target;
            const touchCurrentY = e.touches[0].clientY;
            const slide = target.closest('.slide');
            
            // Если это прокрутка внутри слайда, разрешаем её
            if (slide && slide.scrollHeight > slide.clientHeight) {
                const slideScrollTop = slide.scrollTop;
                const slideScrollHeight = slide.scrollHeight;
                const slideClientHeight = slide.clientHeight;
                
                // Разрешаем прокрутку, если мы не на границах
                if ((slideScrollTop > 0 && touchCurrentY > touchStartY) || 
                    (slideScrollTop < slideScrollHeight - slideClientHeight && touchCurrentY < touchStartY)) {
                    return;
                }
            }
            
            // Предотвращаем pull-to-refresh для основного контейнера
            if (e.scale !== 1) { // Zoom gesture
                e.preventDefault();
            }
        }
    }, { passive: false });
    
    // Улучшенная обработка свайпов
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (e.changedTouches.length === 1) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Проверяем, что это быстрый свайп
            if (deltaTime < 500) {
                const minSwipeDistance = 50;
                const maxSwipeAngle = 30; // Максимальный угол от горизонтали
                
                if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < Math.abs(deltaX) * Math.tan(maxSwipeAngle * Math.PI / 180)) {
                    // Игнорируем свайпы по кнопкам навигации
                    if (e.target.closest('.nav-btn') || e.target.closest('.indicator') || e.target.closest('.swipe-zone')) {
                        return;
                    }
                    
                    e.preventDefault();
                    
                    if (deltaX > 0) {
                        changeSlide(-1); // Swipe right - previous slide
                    } else {
                        changeSlide(1);  // Swipe left - next slide
                    }
                }
            }
        }
    }, { passive: false });
}

// Initialize event listeners
function initEventListeners() {
    const presentationContainer = document.querySelector('.presentation-container');
    
    // Touch events
    presentationContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    presentationContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    presentationContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Double tap for fullscreen
    presentationContainer.addEventListener('touchend', handleDoubleTap, { passive: true });
    
    // Mouse swipe for desktop
    let isMouseDown = false;
    let mouseStartX = 0;
    
    presentationContainer.addEventListener('mousedown', (e) => {
        // Игнорируем клики по кнопкам навигации
        if (e.target.closest('.nav-btn') || e.target.closest('.indicator')) {
            return;
        }
        
        isMouseDown = true;
        mouseStartX = e.clientX;
    });
    
    presentationContainer.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            e.preventDefault();
        }
    });
    
    presentationContainer.addEventListener('mouseup', (e) => {
        if (isMouseDown) {
            const deltaX = e.clientX - mouseStartX;
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    changeSlide(-1);
                } else {
                    changeSlide(1);
                }
            }
            isMouseDown = false;
        }
    });
    
    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen');
        } else {
            document.body.classList.remove('fullscreen');
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', function() {
        // Recalculate positions if needed
        showSlide(currentSlide);
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            showSlide(currentSlide);
        }, 500); // Wait for orientation change to complete
    });
    
    // Initialize button handlers
    initButtonHandlers();
    
    // Initialize mobile optimizations
    initMobileOptimizations();
}

// Prevent pull-to-refresh on mobile - УЛУЧШЕННАЯ
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault(); // Prevent zoom
    }
}, { passive: false });

// Разрешаем прокрутку внутри слайдов - УЛУЧШЕННАЯ
document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        const target = e.target;
        // Разрешаем touch для элементов внутри слайдов
        if (target.closest('.slide') && target.closest('.slide').scrollHeight > target.closest('.slide').clientHeight) {
            // Разрешаем прокрутку если контент больше высоты
            return;
        }
        // Предотвращаем pull-to-refresh только для основного контейнера
        if (!target.closest('.presentation-container')) {
            e.preventDefault();
        }
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) {
        const target = e.changedTouches[0].target;
        // Разрешаем touch для элементов внутри слайдов
        if (target.closest('.slide') && target.closest('.slide').scrollHeight > target.closest('.slide').clientHeight) {
            // Разрешаем прокрутку если контент больше высоты
            return;
        }
        // Предотвращаем pull-to-refresh только для основного контейнера
        if (!target.closest('.presentation-container')) {
            e.preventDefault();
        }
    }
}, { passive: false });

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showSlide(currentSlide);
    initEventListeners();
    
    // Add loading complete class for animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Auto hide mobile navigation after inactivity (optional)
    let navTimeout;
    function showNavigation() {
        const nav = document.querySelector('.presentation-nav');
        const indicators = document.querySelector('.slide-indicators');
        
        if (nav) nav.style.opacity = '1';
        if (indicators) indicators.style.opacity = '1';
        
        clearTimeout(navTimeout);
        navTimeout = setTimeout(() => {
            if (nav) nav.style.opacity = '0.7';
            if (indicators) indicators.style.opacity = '0.7';
        }, 3000);
    }
    
    // Show navigation on interaction
    document.addEventListener('click', showNavigation);
    document.addEventListener('touchstart', showNavigation);
    showNavigation();
});

// Optional: Automatic slide advancement (commented out by default)
// setInterval(() => {
//     if (currentSlide < totalSlides) {
//         changeSlide(1);
//     } else {
//         goToSlide(1);
//     }
// }, 15000); // every 15 seconds