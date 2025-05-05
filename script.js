// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease',
        once: true,
        offset: 100
    });

    // Initialize Swiper Gallery
    const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            // when window width is >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            // when window width is >= 992px
            992: {
                slidesPerView: 3,
                spaceBetween: 40
            }
        }
    });

    // Navbar color change on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            // Here you would typically send the data to your server
            console.log('Form data:', formData);
            
            // Show success message
            alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
            
            // Reset form
            contactForm.reset();
        });
    }

    // Get cabin type from URL parameter for reservas.html
    function getCabinTypeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tipo');
    }

    // Set cabin type in reservation form if available
    const cabinSelect = document.getElementById('tipoCabana');
    
    if (cabinSelect) {
        const cabinType = getCabinTypeFromURL();
        
        if (cabinType) {
            // Find and select the option with the matching value
            for (let i = 0; i < cabinSelect.options.length; i++) {
                if (cabinSelect.options[i].value === cabinType) {
                    cabinSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Trigger change event to update any dependent fields
            const event = new Event('change');
            cabinSelect.dispatchEvent(event);
        }
    }

    // Date picker initialization for reservation form
    const fechaIngreso = document.getElementById('fechaIngreso');
    const fechaSalida = document.getElementById('fechaSalida');
    
    if (fechaIngreso && fechaSalida) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        fechaIngreso.min = today;
        
        // Update min date of checkout when checkin changes
        fechaIngreso.addEventListener('change', function() {
            if (fechaIngreso.value) {
                // Set min checkout date to checkin date
                fechaSalida.min = fechaIngreso.value;
                
                // If current checkout date is before new checkin date, update it
                if (fechaSalida.value && fechaSalida.value < fechaIngreso.value) {
                    fechaSalida.value = fechaIngreso.value;
                }
            }
        });
    }

    // Calculator for pricing in reservation form
    function updatePrice() {
        const cabinSelect = document.getElementById('tipoCabana');
        const adultos = document.getElementById('adultos');
        const ninos = document.getElementById('ninos');
        const fechaIngreso = document.getElementById('fechaIngreso');
        const fechaSalida = document.getElementById('fechaSalida');
        const precioEstimado = document.getElementById('precioEstimado');
        
        if (cabinSelect && adultos && ninos && fechaIngreso && fechaSalida && precioEstimado) {
            // Only calculate if all required fields are filled
            if (cabinSelect.value && fechaIngreso.value && fechaSalida.value) {
                // Get base price for selected cabin type
                let basePrice = 0;
                switch (cabinSelect.value) {
                    case 'familiar':
                        basePrice = 120000; // CLP
                        break;
                    case 'pareja':
                        basePrice = 85000; // CLP
                        break;
                    case 'grupo':
                        basePrice = 150000; // CLP
                        break;
                }
                
                // Calculate number of nights
                const checkIn = new Date(fechaIngreso.value);
                const checkOut = new Date(fechaSalida.value);
                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                
                // Calculate total price
                if (nights > 0) {
                    // Add extra person fee if applicable
                    const totalPersons = parseInt(adultos.value) + parseInt(ninos.value);
                    let extraPersonFee = 0;
                    
                    if (cabinSelect.value === 'familiar' && totalPersons > 6) {
                        extraPersonFee = (totalPersons - 6) * 15000;
                    } else if (cabinSelect.value === 'pareja' && totalPersons > 2) {
                        extraPersonFee = (totalPersons - 2) * 15000;
                    } else if (cabinSelect.value === 'grupo' && totalPersons > 8) {
                        extraPersonFee = (totalPersons - 8) * 15000;
                    }
                    
                    const totalPrice = (basePrice * nights) + extraPersonFee;
                    
                    // Format price as CLP currency
                    const formattedPrice = new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                    }).format(totalPrice);
                    
                    // Update price display
                    precioEstimado.textContent = formattedPrice;
                    precioEstimado.parentElement.classList.remove('d-none');
                }
            }
        }
    }

    // Add event listeners to form fields that affect price
    const priceFields = ['tipoCabana', 'adultos', 'ninos', 'fechaIngreso', 'fechaSalida'];
    
    priceFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('change', updatePrice);
        }
    });

    // Initialize price calculation on page load
    updatePrice();
    
    // Reservation form submission
    const reservationForm = document.getElementById('reservationForm');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(reservationForm);
            const reservationData = {};
            
            for (const [key, value] of formData.entries()) {
                reservationData[key] = value;
            }
            
            // Store reservation data in sessionStorage to use in confirmation page
            sessionStorage.setItem('reservationData', JSON.stringify(reservationData));
            
            // Redirect to payment page
            window.location.href = 'pago.html';
        });
    }

    // Load reservation data on payment page
    const reservationSummary = document.getElementById('reservationSummary');
    
    if (reservationSummary) {
        const reservationData = JSON.parse(sessionStorage.getItem('reservationData'));
        
        if (reservationData) {
            // Update reservation summary on payment page
            document.getElementById('summaryName').textContent = reservationData.nombre;
            document.getElementById('summaryEmail').textContent = reservationData.email;
            document.getElementById('summaryDates').textContent = `${reservationData.fechaIngreso} al ${reservationData.fechaSalida}`;
            
            // Get cabin name based on value
            let cabinName = '';
            switch (reservationData.tipoCabana) {
                case 'familiar':
                    cabinName = 'Cabaña Familiar';
                    break;
                case 'pareja':
                    cabinName = 'Cabaña Pareja';
                    break;
                case 'grupo':
                    cabinName = 'Cabaña Grupo';
                    break;
            }
            
            document.getElementById('summaryCabin').textContent = cabinName;
            document.getElementById('summaryGuests').textContent = `${reservationData.adultos} adultos, ${reservationData.ninos} niños`;
            document.getElementById('summaryPrice').textContent = document.getElementById('precioEstimado').textContent;
        }
    }

    // Handle payment confirmation
    const paymentButton = document.getElementById('paymentButton');
    
    if (paymentButton) {
        paymentButton.addEventListener('click', function(e) {
            // In a real implementation, this would redirect to the payment gateway
            // For demo purposes, redirect directly to confirmation page
            window.location.href = 'confirmacion.html';
        });
    }

    // Load confirmation data
    const confirmationDetails = document.getElementById('confirmationDetails');
    
    if (confirmationDetails) {
        const reservationData = JSON.parse(sessionStorage.getItem('reservationData'));
        
        if (reservationData) {
            // Generate random reservation number
            const reservationNumber = 'R' + Math.floor(100000 + Math.random() * 900000);
            document.getElementById('reservationNumber').textContent = reservationNumber;
            
            // Set customer name
            document.getElementById('customerName').textContent = reservationData.nombre;
            
            // Clear session storage after confirmation
            // sessionStorage.removeItem('reservationData');
        }
    }
});