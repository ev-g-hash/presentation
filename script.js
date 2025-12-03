// Инициализация презентации
document.addEventListener('DOMContentLoaded', function() {
    // Элементы презентации
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideSpan = document.getElementById('currentSlide');
    const totalSlidesSpan = document.getElementById('totalSlides');
    const swipeZones = document.querySelectorAll('.swipe-zone');
    
    // Состояние презентации
    let currentSlide = 1;
    const totalSlides = slides.length;
    
    // Инициализация
    updateSlideCounter();
    updateNavigationButtons();
    
    // Функция смены слайда
    function changeSlide(direction) {
        const newSlide = currentSlide + direction;
        
        if (newSlide >= 1 && newSlide <= totalSlides) {
            showSlide(newSlide);
        }
    }
    
    // Показать конкретный слайд
    function showSlide(slideNumber) {
        // Убрать активный класс со всех слайдов и индикаторов
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Добавить активный класс к нужному слайду и индикатору
        const targetSlide = document.getElementById(`slide${slideNumber}`);
        const targetIndicator = indicators[slideNumber - 1];
        
        if (targetSlide && targetIndicator) {
            targetSlide.classList.add('active');
            targetIndicator.classList.add('active');
            
            currentSlide = slideNumber;
            updateSlideCounter();
            updateNavigationButtons();
            
            // Прокрутить к началу контента слайда
            const slideContent = targetSlide.querySelector('.slide-content');
            if (slideContent) {
                slideContent.scrollTop = 0;
            }
        }
    }
    
    // Перейти к конкретному слайду
    function goToSlide(slideNumber) {
        showSlide(slideNumber);
    }
    
    // Обновить счетчик слайдов
    function updateSlideCounter() {
        if (currentSlideSpan) currentSlideSpan.textContent = currentSlide;
        if (totalSlidesSpan) totalSlidesSpan.textContent = totalSlides;
    }
    
    // Обновить состояние кнопок навигации
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSlide === totalSlides;
        }
    }
    
    // Обработчики событий для кнопок навигации
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeSlide(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeSlide(1));
    }
    
    // Обработчики для индикаторов
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index + 1));
    });
    
    // Обработчики для swipe зон
    swipeZones.forEach(zone => {
        zone.addEventListener('click', function() {
            if (this.classList.contains('swipe-zone-left')) {
                changeSlide(-1);
            } else if (this.classList.contains('swipe-zone-right')) {
                changeSlide(1);
            }
        });
    });
    
    // Обработка клавиатуры
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                changeSlide(-1);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                event.preventDefault();
                changeSlide(1);
                break;
            case 'Home':
                event.preventDefault();
                showSlide(1);
                break;
            case 'End':
                event.preventDefault();
                showSlide(totalSlides);
                break;
        }
    });
    
    // Обработка касаний для мобильных устройств
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        // Проверяем, что это горизонтальный свайп, а не вертикальный
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Свайп вправо - предыдущий слайд
                changeSlide(-1);
            } else {
                // Свайп влево - следующий слайд
                changeSlide(1);
            }
        }
    }
    
    // Автопрокрутка (опционально, можно отключить)
    let autoScrollInterval;
    
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            if (currentSlide < totalSlides) {
                changeSlide(1);
            } else {
                showSlide(1); // Зацикливаем
            }
        }, 10000); // 10 секунд
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }
    
    // Останавливаем автопрокрутку при взаимодействии
    document.addEventListener('click', stopAutoScroll);
    document.addEventListener('keydown', stopAutoScroll);
    document.addEventListener('touchstart', stopAutoScroll);
    
    // Раскомментировать для включения автопрокрутки
    // startAutoScroll();
    
    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        // При изменении размера убеждаемся, что текущий слайд корректно отображается
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            const slideContent = activeSlide.querySelector('.slide-content');
            if (slideContent) {
                slideContent.scrollTop = 0;
            }
        }
    });
    
    // Предотвращение контекстного меню на swipe зонах (для лучшего UX на мобильных)
    swipeZones.forEach(zone => {
        zone.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    });
    
    // Добавляем визуальную обратную связь для кнопок
    function addButtonFeedback() {
        const buttons = document.querySelectorAll('button, .nav-btn, .indicator, .project-link-btn, .bonus-link-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mousedown', function() {
                this.style.transform = this.style.transform + ' scale(0.95)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = this.style.transform.replace(' scale(0.95)', '');
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = this.style.transform.replace(' scale(0.95)', '');
            });
        });
    }
    
    addButtonFeedback();
    
    // Функция для плавного появления элементов при загрузке
    function animateSlideContent() {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            const elements = activeSlide.querySelectorAll('.app-card, .model-card, .function-card, .tech-item, .feature-item, .stat-item');
            elements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    }
    
    // Запускаем анимацию для первого слайда
    setTimeout(animateSlideContent, 100);
    
    // Обновляем анимацию при смене слайда
    const originalShowSlide = showSlide;
    showSlide = function(slideNumber) {
        originalShowSlide(slideNumber);
        setTimeout(animateSlideContent, 100);
    };
    
    console.log('🎉 Презентация "Подарок в большом городе" загружена!');
    console.log('📱 Поддерживается навигация: кнопки, индикаторы, клавиатура, свайпы');
    console.log('🎯 Горячие клавиши: ← → ↑ ↓ Space, Home, End');
});

// Дополнительные утилиты
window.presentationUtils = {
    // Функция для программного перехода к слайду
    goToSlide: function(slideNumber) {
        if (typeof goToSlide === 'function') {
            goToSlide(slideNumber);
        }
    },
    
    // Функция для получения текущего слайда
    getCurrentSlide: function() {
        return currentSlide || 1;
    },
    
    // Функция для получения общего количества слайдов
    getTotalSlides: function() {
        return totalSlides || 8;
    }
};