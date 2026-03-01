document.addEventListener('DOMContentLoaded', function() {
  AOS.init({
   duration: 800,
   easing: 'ease-in-out',
   once: true,
   mirror: false,
   disable: window.innerWidth < 768
 });
 
 (function() {
   const _0xc87b = ['WGNsaXBzZSBOZXR3b3Jrcw==', 'aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS90aGVraWRsZWVyb3kubS8='];
 
   const config = {
     checkInterval: 1000,
     copyrightText: window.atob(_0xc87b[0]),
     discordLink: window.atob(_0xc87b[1]),
     targetSelectors: [
       '.container', 
       'footer', 
       'section', 
       '.content-wrapper', 
       '.bg-dark-light/50'
     ],
     buttonContainers: [
       '.flex.flex-col.sm\\:flex-row.gap-4.justify-center',
       '.flex.flex-col.sm\\:flex-row.justify-center.gap-3'
     ]
   };
 
   function createCopyrightHTML() {
     return `<a href="${config.discordLink}" target="_blank" class="hover:no-underline cursor-pointer">
       <p class="text-xs text-gray-400 relative z-10 hover:scale-105 transition-transform duration-300 copyright-text">
         <span class="bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] bg-clip-text text-transparent font-semibold">Copyright by</span>
         <span class="text-white font-semibold tracking-wide"> ${config.copyrightText}</span>
       </p>
     </a>`;
   }
 
   function ensureCopyright() {
     if (window._ensuringCopyright || window._alreadyEnsured) {
       return; 
     }
 
     window._ensuringCopyright = true;
 
     try {
       let holders = document.querySelectorAll('.copyright-holder');
       const holderCount = holders.length;
 
       if (holderCount === 0) {
         console.info('Telif hakkı koruması: Eksik telif hakkı bilgisi tespit edildi. Yeniden ekleniyor...');
         createMissingCopyrights();
         holders = document.querySelectorAll('.copyright-holder');
       }
 
       const maxProcessElements = Math.min(holders.length, 10);
       for (let i = 0; i < maxProcessElements; i++) {
         const holder = holders[i];
         if (!holder.querySelector('.copyright-text') || !holder.querySelector('.copyright-text').textContent.includes('Copyright')) {
           holder.innerHTML = createCopyrightHTML();
         }
         
         if (!holder._observed) {
           observeCopyrightElement(holder);
           holder._observed = true;
         }
       }
 
       checkButtonContainers();
 
       window._alreadyEnsured = true;
       return holders.length;
     } catch (err) {
       console.warn('Telif hakkı koruması: Hata oluştu', err);
       return 0;
     } finally {
       window._ensuringCopyright = false;
     }
   }
 
   function checkButtonContainers() {
     config.buttonContainers.forEach(selector => {
       try {
         const containers = document.querySelectorAll(selector);
         containers.forEach(container => {
           const nextElement = container.nextElementSibling;
           if (!nextElement || !nextElement.classList.contains('copyright-holder')) {
             const copyrightDiv = createCopyrightElement();
             container.parentNode.insertBefore(copyrightDiv, container.nextSibling);
             observeCopyrightElement(copyrightDiv);
           }
         });
       } catch (err) {
         console.warn('Telif hakkı koruması: Buton konteyner kontrolü sırasında hata oluştu', err);
       }
     });
   }
 
   function createMissingCopyrights() {
     let addedCount = 0;
 
     config.targetSelectors.forEach(selector => {
       try {
         const elements = document.querySelectorAll(selector);
         elements.forEach(element => {
           if (!elementContainsCopyright(element)) {
             const copyrightDiv = createCopyrightElement();
 
             if (element.tagName.toLowerCase() === 'footer') {
               const existingCopyright = element.querySelector('.text-center.text-gray-500.text-sm');
               if (existingCopyright) {
                 existingCopyright.parentNode.insertBefore(copyrightDiv, existingCopyright);
                 addedCount++;
                 return;
               }
             }
 
             element.appendChild(copyrightDiv);
             addedCount++;
           }
         });
       } catch (err) {
         console.warn('Telif hakkı koruması: Element ekleme sırasında hata oluştu', err);
       }
     });
 
     return addedCount;
   }
 
   function elementContainsCopyright(element, depth = 3) {
     if (!element || depth <= 0) return false;
     
     if (element.querySelector('.copyright-holder')) {
       return true;
     }
     
     return element.parentElement ? elementContainsCopyright(element.parentElement, depth - 1) : false;
   }
 
   function createCopyrightElement() {
     const div = document.createElement('div');
     div.className = 'mt-4 pt-2 text-center opacity-60 hover:opacity-100 transition-opacity duration-300 copyright-holder';
     div.innerHTML = createCopyrightHTML();
     return div;
   }
 
   function observeCopyrightElement(element) {
     if (!element || element._observed) return;
 
     const observer = new MutationObserver(mutations => {
       mutations.forEach(mutation => {
         if (mutation.type === 'childList') {
           const textElement = mutation.target.querySelector('.copyright-text');
           if (!textElement || !textElement.textContent.includes('Copyright')) {
             mutation.target.innerHTML = createCopyrightHTML();
           }
         } else if (mutation.type === 'attributes') {
           if (mutation.attributeName === 'style') {
             const style = mutation.target.style;
             if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
               style.display = '';
               style.visibility = '';
               style.opacity = '0.6';
               console.warn('Telif hakkı koruması: Stil değişikliği engellendi');
             }
           } else if (mutation.attributeName === 'class') {
             if (!mutation.target.classList.contains('copyright-holder')) {
               mutation.target.classList.add('copyright-holder');
             }
           }
         }
       });
     });
 
     observer.observe(element, {
       attributes: true,
       childList: true,
       subtree: true,
       attributeFilter: ['style', 'class']
     });
 
     protectElementStyle(element);
   }
 
   function protectElementStyle(element) {
     if (!element) return;
 
     let originalStyle = element.style;
     Object.defineProperty(element, 'style', {
       get: function() {
         return originalStyle;
       },
       set: function(value) {
         if (value && (
           (value.display === 'none') || 
           (value.visibility === 'hidden') || 
           (value.opacity === '0')
         )) {
           console.warn('Telif hakkı koruması: Stil değişikliği engellendi');
           return;
         }
         originalStyle = value;
       },
       configurable: false
     });
   }
 
   function monitorDOMChanges() {
     const bodyObserver = new MutationObserver(() => {
       if (!window._alreadyEnsured) {
         ensureCopyright();
       }
     });
 
     bodyObserver.observe(document.body, {
       childList: true,
       subtree: true
     });
 
     setInterval(() => {
       if (!window._alreadyEnsured) {
         ensureCopyright();
       }
     }, 5000); 
   }
 
   function initCopyrightProtection() {
     if (window._initializingCopyright) return;
     window._initializingCopyright = true;
 
     if (document.readyState === 'complete') {
       ensureCopyright();
       monitorDOMChanges();
     } else {
       document.addEventListener('DOMContentLoaded', () => {
         ensureCopyright();
         monitorDOMChanges();
       }, { once: true });
 
       window.addEventListener('load', () => {
         ensureCopyright();
       }, { once: true });
     }

     setTimeout(() => {
       ensureCopyright();
     }, 1000);
   }
 
   initCopyrightProtection();
 })();
 

   const initReadMoreButtons = function() {
     const readMoreButtons = document.querySelectorAll('.read-more-btn');
     
     readMoreButtons.forEach(button => {
       button.addEventListener('click', function() {
         const updateContent = this.closest('.update-content');
         const fullDescription = updateContent.querySelector('.full-description');
         const readMoreText = this.querySelector('.read-more-text');

         const isHidden = fullDescription.classList.contains('hidden');

         if (isHidden) {
           fullDescription.style.maxHeight = '0';
           fullDescription.style.opacity = '0';
           fullDescription.style.transform = 'translateY(-15px)';
           fullDescription.style.transition = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.6s ease';
           
           fullDescription.classList.remove('hidden');
           this.classList.add('active');
           
           setTimeout(() => {
             fullDescription.style.maxHeight = '800px'; 
             fullDescription.style.opacity = '1';
             fullDescription.style.transform = 'translateY(0)';

             const ripple = document.createElement('span');
             ripple.className = 'ripple-effect';
             button.appendChild(ripple);

             const diameter = Math.max(button.clientWidth, button.clientHeight);

             ripple.style.width = ripple.style.height = `${diameter}px`;
             ripple.style.top = `${-diameter/2 + button.clientHeight/2}px`;
             ripple.style.left = `${-diameter/2 + button.clientWidth/2}px`;

             setTimeout(() => {
               ripple.remove();
             }, 800);
           }, 50);
           
           // Add subtle animation to list items for a staggered effect
           const listItems = fullDescription.querySelectorAll('li');
           listItems.forEach((item, index) => {
             item.style.opacity = '0';
             item.style.transform = 'translateX(-10px)';
             
             setTimeout(() => {
               item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
               item.style.opacity = '1';
               item.style.transform = 'translateX(0)';
             }, 100 + 50 * index); // Start after the container begins animating
           });
           
           // Add subtle animation to other elements for a complete effect
           const paragraphs = fullDescription.querySelectorAll('p');
           paragraphs.forEach((paragraph, index) => {
             paragraph.style.opacity = '0';
             paragraph.style.transform = 'translateY(8px)';
             
             setTimeout(() => {
               paragraph.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
               paragraph.style.opacity = '1';
               paragraph.style.transform = 'translateY(0)';
             }, 70 + 40 * index);
           });
           
           // Animate the background color of content boxes for a nice effect
           const contentBoxes = fullDescription.querySelectorAll('.bg-[#0f1524]/80');
           contentBoxes.forEach((box, index) => {
             box.style.transition = 'background-color 0.8s ease, transform 0.5s ease';
             
             setTimeout(() => {
               box.style.transform = 'scale(1.01)';
               setTimeout(() => {
                 box.style.transform = 'scale(1)';
               }, 300);
             }, 100 + 150 * index);
           });
           
           // Update button text
           readMoreText.textContent = 'Show Less';
         } else {
           // Hide description with animation
           fullDescription.style.opacity = '0';
           fullDescription.style.transform = 'translateY(-10px)';
           fullDescription.style.maxHeight = '0';
           this.classList.remove('active');
           
           // Create ripple effect on button for closing
           const ripple = document.createElement('span');
           ripple.className = 'ripple-effect ripple-close';
           button.appendChild(ripple);
           
           // Get the largest diameter of the button
           const diameter = Math.max(button.clientWidth, button.clientHeight);
           
           // Set the size and position of the ripple
           ripple.style.width = ripple.style.height = `${diameter}px`;
           ripple.style.top = `${-diameter/2 + button.clientHeight/2}px`;
           ripple.style.left = `${-diameter/2 + button.clientWidth/2}px`;
           
           // Remove the ripple after animation completes
           setTimeout(() => {
             ripple.remove();
           }, 800);
           
           // Adding delay before fully hiding to allow animation to complete
           setTimeout(() => {
             fullDescription.classList.add('hidden');
             fullDescription.style.opacity = '';
             fullDescription.style.transform = '';
             fullDescription.style.maxHeight = '';
           }, 500);
           
           // Update button text
           readMoreText.textContent = 'Show More';
         }
       });
     });
   };
 
   // Initialize Read More functionality when page is loaded
   if (document.readyState === 'loading') {
     document.addEventListener('DOMContentLoaded', initReadMoreButtons);
   } else {
     initReadMoreButtons();
   }
 
   // Number Counter Animation
   const numberCounters = document.querySelectorAll('.number-counter');
   const observerOptions = {
     threshold: 0.5
   };
 
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         const counter = entry.target;
         const target = parseInt(counter.getAttribute('data-target'));
         const duration = 800; // 800 milisaniye (daha hızlı animasyon için)
         const start = parseInt(counter.textContent);
         const range = target - start;
         
         // Eğer hedef 100'den büyükse, ilk önce (hedef-100)'e hızlıca atla
         // Sonra son 100 sayıyı normal hızda say
         const fastTarget = range > 100 ? target - 100 : start;
         
         // Hızlı kısım için sürenin %30'unu, yavaş kısım için %70'ini kullan
         const fastDuration = duration * 0.3;
         const slowDuration = duration * 0.7;
         
         // Hızlı kısım
         if (fastTarget > start) {
           counter.textContent = fastTarget;
           
           // Yavaş kısım
           let current = fastTarget;
           const slowRange = target - fastTarget;
           const stepTime = Math.abs(Math.floor(slowDuration / slowRange));
           
           const updateCounter = () => {
             current += 1;
             counter.textContent = current;
             
             if (current < target) {
               setTimeout(updateCounter, stepTime);
             }
           };
           
           setTimeout(updateCounter, fastDuration);
         } else {
           // Hedef zaten küçükse veya 100'den az bir değişim varsa normal sayma
           let current = start;
           const stepTime = Math.abs(Math.floor(duration / range));
           
           const updateCounter = () => {
             current += 1;
             counter.textContent = current;
             
             if (current < target) {
               setTimeout(updateCounter, stepTime);
             }
           };
           
           updateCounter();
         }
         
         observer.unobserve(counter);
       }
     });
   }, observerOptions);
 
   numberCounters.forEach(counter => {
     observer.observe(counter);
   });
 
   // Scroll Buttons
   const scrollToTopBtn = document.getElementById('scrollToTop');
   const scrollToBottomBtn = document.getElementById('scrollToBottom');
   
   // Scroll butonlarının görünürlüğü
   window.addEventListener('scroll', function() {
     const windowHeight = window.innerHeight;
     const fullHeight = document.documentElement.scrollHeight;
     const scrolled = window.pageYOffset;
     const scrollableDistance = fullHeight - windowHeight;
     
     // En aşağıdaysa sadece yukarı butonu göster
     if (Math.ceil(scrolled) >= scrollableDistance - 10) {
       scrollToTopBtn.classList.remove('opacity-0', 'invisible', 'scale-90');
       scrollToTopBtn.classList.add('opacity-100', 'visible', 'scale-100');
       scrollToBottomBtn.classList.add('opacity-0', 'invisible', 'scale-90');
       scrollToBottomBtn.classList.remove('opacity-100', 'visible', 'scale-100');
     }
     // En yukarıdaysa sadece aşağı butonu göster
     else if (scrolled < 100) {
       scrollToBottomBtn.classList.remove('opacity-0', 'invisible', 'scale-90');
       scrollToBottomBtn.classList.add('opacity-100', 'visible', 'scale-100');
       scrollToTopBtn.classList.add('opacity-0', 'invisible', 'scale-90');
       scrollToTopBtn.classList.remove('opacity-100', 'visible', 'scale-100');
     }
     // Ortadaysa ikisini de gizle
     else {
       scrollToTopBtn.classList.add('opacity-0', 'invisible', 'scale-90');
       scrollToBottomBtn.classList.add('opacity-0', 'invisible', 'scale-90');
       scrollToTopBtn.classList.remove('opacity-100', 'visible', 'scale-100');
       scrollToBottomBtn.classList.remove('opacity-100', 'visible', 'scale-100');
     }
   });
   
   // Yukarı çıkma fonksiyonu
   scrollToTopBtn.addEventListener('click', function() {
     window.scrollTo({
       top: 0,
       behavior: 'smooth'
     });
   });
   
   // Aşağı inme fonksiyonu
   scrollToBottomBtn.addEventListener('click', function() {
     window.scrollTo({
       top: document.documentElement.scrollHeight,
       behavior: 'smooth'
     });
   });
 
   // Main Slider Functionality
   const mainSlider = document.getElementById('mainSlider');
   const sliderDots = document.querySelectorAll('.slider-dot');
   const sliderPrevButton = mainSlider?.parentElement?.querySelector('.fa-chevron-left')?.parentElement;
   const sliderNextButton = mainSlider?.parentElement?.querySelector('.fa-chevron-right')?.parentElement;
   let currentSlide = 0;
   let slideInterval;
   const slideCount = 3;
   const autoSlideDelay = 5000; // 5 seconds
 
   function updateSlider() {
     if (!mainSlider) return;
     mainSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
     
     // Update dots
     sliderDots.forEach((dot, index) => {
       if (index === currentSlide) {
         dot.classList.add('bg-white', 'scale-125');
         dot.classList.remove('bg-white/50');
       } else {
         dot.classList.remove('bg-white', 'scale-125');
         dot.classList.add('bg-white/50');
       }
     });
   }
 
   function nextSlide() {
     currentSlide = (currentSlide + 1) % slideCount;
     updateSlider();
   }
 
   function prevSlide() {
     currentSlide = (currentSlide - 1 + slideCount) % slideCount;
     updateSlider();
   }
 
   function startAutoSlide() {
     if (slideInterval) clearInterval(slideInterval);
     slideInterval = setInterval(nextSlide, autoSlideDelay);
   }
 
   function stopAutoSlide() {
     if (slideInterval) {
       clearInterval(slideInterval);
     }
   }
 
   // Event Listeners for Slider
   if (sliderPrevButton && sliderNextButton) {
     sliderPrevButton.addEventListener('click', () => {
       prevSlide();
       stopAutoSlide();
       startAutoSlide();
     });
 
     sliderNextButton.addEventListener('click', () => {
       nextSlide();
       stopAutoSlide();
       startAutoSlide();
     });
   }
 
   sliderDots.forEach((dot, index) => {
     dot.addEventListener('click', () => {
       currentSlide = index;
       updateSlider();
       stopAutoSlide();
       startAutoSlide();
     });
   });
 
   // Start auto sliding
   if (mainSlider) {
     startAutoSlide();
 
     // Pause auto slide on hover
     mainSlider.parentElement.addEventListener('mouseenter', stopAutoSlide);
     mainSlider.parentElement.addEventListener('mouseleave', startAutoSlide);
   }
 
   // Mobile Menu Function
   const mobileMenuButton = document.getElementById('mobile-menu-button');
   const mobileMenu = document.getElementById('mobile-menu');
   let isMenuOpen = false;
 
   if (mobileMenuButton && mobileMenu) {
     const toggleMenu = () => {
       isMenuOpen = !isMenuOpen;
       
       // Icon değişimi
       const icon = mobileMenuButton.querySelector('i');
       icon.classList.remove(isMenuOpen ? 'fa-bars' : 'fa-times');
       icon.classList.add(isMenuOpen ? 'fa-times' : 'fa-bars');
       
       // Menü görünürlüğü
       if (isMenuOpen) {
         mobileMenu.classList.remove('hidden');
         document.body.classList.add('menu-open');
         setTimeout(() => {
           mobileMenu.style.opacity = '1';
           mobileMenu.style.transform = 'translateY(0)';
         }, 10);
       } else {
         mobileMenu.style.opacity = '0';
         mobileMenu.style.transform = 'translateY(-10px)';
         document.body.classList.remove('menu-open');
         setTimeout(() => {
           mobileMenu.classList.add('hidden');
         }, 300);
       }
     };
 
     // Menü butonuna tıklama
     mobileMenuButton.addEventListener('click', (e) => {
       e.stopPropagation();
       toggleMenu();
     });
 
     // Sayfa dışına tıklama ile menüyü kapatma
     document.addEventListener('click', (e) => {
       if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
         toggleMenu();
       }
     });
 
     // ESC tuşu ile menüyü kapatma
     document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape' && isMenuOpen) {
         toggleMenu();
       }
     });
 
     // Mobil menü scroll kontrolü
     let touchStartY = 0;
     let touchEndY = 0;
 
     mobileMenu.addEventListener('touchstart', (e) => {
       touchStartY = e.touches[0].clientY;
     }, { passive: true });
 
     mobileMenu.addEventListener('touchmove', (e) => {
       touchEndY = e.touches[0].clientY;
       const scrollTop = mobileMenu.scrollTop;
       const scrollHeight = mobileMenu.scrollHeight;
       const clientHeight = mobileMenu.clientHeight;
       
       // Üstte ve aşağı kaydırma yapmaya çalışıyorsa
       if (scrollTop === 0 && touchEndY > touchStartY) {
         e.preventDefault();
       }
       
       // Altta ve yukarı kaydırma yapmaya çalışıyorsa
       if (scrollTop + clientHeight >= scrollHeight && touchEndY < touchStartY) {
         e.preventDefault();
       }
     }, { passive: false });
 
     // Kopyalama butonları için işlevsellik
     function initializeCopyButtons() {
       const copyButtons = document.querySelectorAll('.copy-button');
       copyButtons.forEach(button => {
         button.addEventListener('click', async function() {
           const parentElement = this.closest('.flex');
           const codeElement = parentElement?.querySelector('.server-connection');
           
           if (codeElement) {
             try {
               await navigator.clipboard.writeText(codeElement.textContent);
               // Başarılı kopyalama geri bildirimi
               const originalHTML = this.innerHTML;
               this.innerHTML = '<i class="fas fa-check text-[#10b981]"></i>';
               this.classList.add('text-[#10b981]');
               
               setTimeout(() => {
                 this.innerHTML = originalHTML;
                 this.classList.remove('text-[#10b981]');
               }, 2000);
             } catch (err) {
               console.error('Kopyalama hatası:', err);
               // Hata durumunda geri bildirim
               const originalHTML = this.innerHTML;
               this.innerHTML = '<i class="fas fa-times text-red-500"></i>';
               
               setTimeout(() => {
                 this.innerHTML = originalHTML;
               }, 2000);
             }
           }
         });
       });
     }
 
     // Footer IP kopyalama butonu için işlevsellik
     function initializeFooterCopyButton() {
       const footerCopyButton = document.querySelector('.copy-ip-footer');
       if (footerCopyButton) {
         // Önceki event listener'ları temizle
         const newButton = footerCopyButton.cloneNode(true);
         footerCopyButton.parentNode.replaceChild(newButton, footerCopyButton);

         newButton.addEventListener('click', async function() {
           const footerIp = document.querySelector('.footer-ip');
           if (footerIp) {
             try {
               await navigator.clipboard.writeText(footerIp.textContent);
               // Başarılı kopyalama geri bildirimi
               const originalHTML = this.innerHTML;
               this.innerHTML = '<i class="fas fa-check text-[#10b981]"></i>';
               this.classList.add('text-[#10b981]');
               
               setTimeout(() => {
                 this.innerHTML = originalHTML;
                 this.classList.remove('text-[#10b981]');
               }, 2000);
             } catch (err) {
               console.error('Footer IP kopyalama hatası:', err);
               // Hata durumunda geri bildirim
               const originalHTML = this.innerHTML;
               this.innerHTML = '<i class="fas fa-times text-red-500"></i>';
               
               setTimeout(() => {
                 this.innerHTML = originalHTML;
               }, 2000);
             }
           }
         });
       }
     }
 
     // Kopyalama işlevlerini başlat
     initializeCopyButtons();
     initializeFooterCopyButton();
 
     // Sayfa yüklendiğinde menüyü gizle
     mobileMenu.style.opacity = '0';
     mobileMenu.style.transform = 'translateY(-10px)';
   }
 
   // Smooth Scroll
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', function (e) {
       e.preventDefault();
       
       const targetId = this.getAttribute('href');
       const targetElement = document.querySelector(targetId);
       
       if (targetElement) {
         // Close mobile menu if open
         if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
           mobileMenu.classList.add('hidden');
         }
         
         window.scrollTo({
           top: targetElement.offsetTop - 70, // Offset for navbar height
           behavior: 'smooth'
         });
       }
     });
   });
 
   const navbar = document.querySelector('nav');
   window.addEventListener('scroll', function() {
     if (window.scrollY > 50) {
       navbar.classList.add('bg-opacity-90', 'backdrop-blur-sm');
       navbar.classList.remove('bg-opacity-100');
     } else {
       navbar.classList.remove('bg-opacity-90', 'backdrop-blur-sm');
       navbar.classList.add('bg-opacity-100');
     }
   });
 
   const contactForm = document.getElementById('contact-form');
   if (contactForm) {
     contactForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       const submitButton = contactForm.querySelector('button[type="submit"]');
       const originalText = submitButton.innerHTML;

       const formData = new FormData(contactForm);
       const name = formData.get('name');
       const email = formData.get('email');
       const subject = formData.get('subject');
       const message = formData.get('message');

       const webhookBody = {
         username: "Xclipse Contact System",
         avatar_url: "https://ankara.tfo.k12.tr/wp-content/uploads/2022/06/Ataturk.jpg",
         embeds: [{
           author: {
             name: "Contact Form Notification",
             icon_url: "https://r2.fivemanage.com/2P9FjNbfkvdwqJtyhr4v5/sitelogo.webp"
           },
           title: "📬 New Message Received",
           description: [
             "```yaml",
             "A new contact form submission has been received.",
             "Please review the details below.",
             "```",
             "",
             "### 👤 Contact Information",
             `> **Full Name:** ${name}`,
             `> **Email Address:** \`${email}\``,
             "",
             "### 📝 Message Details",
             `> **Subject:** ${subject}`,
             "",
             "### 💬 Message Content",
             "```" + message + "```",
             "",
             "### 📌 Additional Information",
             "> **Submission Time:** " + new Date().toLocaleString('en-US', {
               weekday: 'long',
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
               timeZoneName: 'short'
             }),
             "> **Source:** Website Contact Form",
             "> **IP:** Contact Form Submission"
           ].join("\n"),
           color: 0x2ecc71,
           thumbnail: {
             url: "https://r2.fivemanage.com/2P9FjNbfkvdwqJtyhr4v5/sitelogo.webp"
           },
           footer: {
             text: "EYES ROLEPLAY • Contact Management System",
             icon_url: "https://r2.fivemanage.com/2P9FjNbfkvdwqJtyhr4v5/sitelogo.webp"
           },
           timestamp: new Date().toISOString()
         }]
       };

       try {
         submitButton.disabled = true;
         submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Sending...';

         const response = await fetch('', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(webhookBody)
         });

         if (response.ok) {
           submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Message Sent!';
           submitButton.classList.add('bg-green-500');
           contactForm.reset();

           setTimeout(() => {
             submitButton.disabled = false;
             submitButton.innerHTML = originalText;
             submitButton.classList.remove('bg-green-500');
           }, 2000);
         } else {
           throw new Error('Failed to send message');
         }
       } catch (error) {
         console.error('Error:', error);
         submitButton.innerHTML = originalText;
         submitButton.disabled = false;

         const altContactDiv = document.createElement('div');
         altContactDiv.className = 'mt-4 p-4 bg-dark/50 backdrop-blur-sm rounded-xl border border-red-500/20 shadow-lg';
         altContactDiv.innerHTML = `
           <div class="flex items-center gap-3 mb-3">
             <div class="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
               <i class="fas fa-exclamation-circle text-red-500"></i>
             </div>
             <p class="text-white/90 text-sm">Please use alternative contact methods:</p>
           </div>
           <div class="flex gap-2">
             <a href="https://discord.gg/EkwWvFS" target="_blank" 
               class="flex-1 px-4 py-2.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 rounded-lg text-[#5865F2] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group">
               <i class="fab fa-discord text-lg group-hover:scale-110 transition-transform"></i>
               <span class="text-sm font-medium">Discord</span>
             </a>
             <a href="mailto:owner@xclipsenetworks.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}" 
               class="flex-1 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group">
               <i class="fas fa-envelope text-lg group-hover:scale-110 transition-transform"></i>
               <span class="text-sm font-medium">Email</span>
             </a>
           </div>
         `;

         if (!document.querySelector('.alt-contact')) {
           altContactDiv.classList.add('alt-contact');
           contactForm.appendChild(altContactDiv);
         }
       }
     });
   }
 
   const serverDetails = {
     ip: "fivem://connect/eyesrp",
     directConnect: "fivem://connect/eyesrp",
     cfxConnect: "cfx.re/join/eyesrp",
     maxPlayers: 64,
     currentPlayers: 0,
     currentPing: "45ms",
     serverEndpoint: "eyesrp",
     serverVersion: "1.0.0",
     lastRestart: "2 days ago",
     nextMaintenance: "5 days",
     serverLocation: "Frankfurt, DE",
     backupFrequency: "Every 6h",
     ddosProtection: "Enabled",
     serverType: "Dedicated",
     serverRegion: "Europe",
     serverProvider: "OVH",
     serverUptime: "99.9%",
     framework: "ESX Legacy",
     scriptVersion: "1.9.4",
     gameVersion: "1.68",
     voiceSystem: "Mumble 2.0",
     anticheat: "EyeAC v3",
     resourceCount: 298,
     serverScore: 11862,
     discordMembers: '5.2K',
     discordOnline: '1.8K',
   };

   async function fetchServerDetails() {
     try {
       const response = await fetch('https://servers-frontend.fivem.net/api/servers/single/53m5qd');
       const data = await response.json();
       try {
         const discordResponse = await fetch('https://discord.com/api/v9/guilds/1474769015057682626/preview', {
           headers: {
             'Authorization': 'MTQ3NDk5NjEwOTkzNTEyMDQ5Ng.GtVXW8.M98zORiY986VBibYfEpzNyZsb0IsDq6Ttdisj4'
           }
         });
         const discordData = await discordResponse.json();
         if (discordData) {
           serverDetails.discordMembers = formatNumber(discordData.approximate_member_count);
           serverDetails.discordOnline = formatNumber(discordData.approximate_presence_count);
         }
       } catch (discordError) {
         console.warn('Discord bilgileri çekilemedi:', discordError);
       }
       if (data && data.Data) {
         const serverInfo = data.Data;
         serverDetails.currentPlayers = serverInfo.clients || 0;
         serverDetails.maxPlayers = serverInfo.sv_maxclients || 64;
         serverDetails.playerCount = `${serverDetails.currentPlayers}/${serverDetails.maxPlayers}`;
         serverDetails.currentPing = `${serverInfo.vars?.ping || '45'}ms`;
         serverDetails.serverEndpoint = serverInfo.EndPoint || 'eyesrp';
         serverDetails.ip = `fivem://connect/${serverInfo.EndPoint}`;
         serverDetails.directConnect = serverDetails.ip;
         serverDetails.cfxConnect = `cfx.re/join/${serverInfo.EndPoint}`;
         if (serverInfo.vars) {
           serverDetails.serverVersion = serverInfo.vars.sv_version || "1.0.0";
           serverDetails.gameVersion = serverInfo.vars.gameVersion || "1.68";
           serverDetails.framework = serverInfo.vars.framework || "ESX Legacy";
           serverDetails.voiceSystem = serverInfo.vars.voiceSystem || "Mumble 2.0";
         }
         if (serverInfo.resources) {
           serverDetails.resourceCount = serverInfo.resources.length;
         }
         if (serverInfo.rank) {
           serverDetails.serverScore = serverInfo.rank;
         }
         updateServerElements();
       }
     } catch (error) {
       console.error('Sunucu bilgileri çekilemedi:', error);
       updateServerElements();
     }
   }

   function updateServerElements() {
     // Temel Sunucu Bilgileri
     const elementMappings = {
       '.quick-stats-players': serverDetails.playerCount || '0/64',
       '.quick-stats-ping': serverDetails.currentPing || '45ms',
       '.server-region, [data-server-region]': serverDetails.serverRegion || 'Europe',
       '.server-version, [data-server-version]': serverDetails.serverVersion || '1.8.5',
       '.last-restart, [data-last-restart]': serverDetails.lastRestart || '2 hours ago',
       '.server-status': 'Online',
       '.server-connection': serverDetails.ip,
       '.server-score': serverDetails.serverScore,
       '.resource-count, .server-resources': serverDetails.resourceCount,
       '.server-uptime': serverDetails.serverUptime || '99.9%',
       '.server-framework': serverDetails.framework || 'ESX Legacy',
       '.server-owner': 'Mire05',
       '.discord-members': serverDetails.discordMembers || '5.2K',
       '.discord-online': serverDetails.discordOnline || '1.8K',
       '.total-players': `${serverDetails.currentPlayers || 0}`,
       '.max-players': `${serverDetails.maxPlayers || 64}`,
       '.server-location': serverDetails.serverLocation || 'Frankfurt, DE',
       '#server-framework': serverDetails.framework || 'ESX Legacy',
       '#script-version': serverDetails.scriptVersion || '1.9.4',
       '#game-version': serverDetails.gameVersion || '1.68',
       '#voice-system': serverDetails.voiceSystem || 'Mumble 2.0',
       '#anticheat': serverDetails.anticheat || 'EyeAC v3',
       '.footer-ip': serverDetails.ip,
       '.server-status-text': 'Online',
       '.server-status-indicator': '',  
     };

     for (const [selector, value] of Object.entries(elementMappings)) {
       updateElements(selector, value);
     }

     updateStatusIndicators();
     updateConnectionButtons();
     initializeCopyButtons();
   }

   function updateStatusIndicators() {
     const statusIndicators = document.querySelectorAll('.server-status-indicator');
     statusIndicators.forEach(indicator => {
       indicator.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
       indicator.classList.add('bg-green-500');
     });

     // Status text'lerini güncelle
     const statusTexts = document.querySelectorAll('.server-status-text');
     statusTexts.forEach(text => {
       text.textContent = 'Online';
       text.classList.remove('text-red-500', 'text-yellow-500');
       text.classList.add('text-green-500');
     });
   }

   function updateElements(selector, value) {
     try {
       const elements = document.querySelectorAll(selector);
       elements.forEach(el => {
         if (el) {
           // Data attribute varsa onu da güncelle
           if (el.hasAttribute('data-value')) {
             el.setAttribute('data-value', value);
           }
           // Element içeriğini güncelle
           el.textContent = value;
         }
       });
     } catch (error) {
       console.error(`Error updating elements with selector ${selector}:`, error);
     }
   }

   function updateConnectionButtons() {
     const connectButtons = document.querySelectorAll('.connect-button, .join-now-btn');
     const isOnline = true; // Sunucu durumunu kontrol et
     
     connectButtons.forEach(button => {
       if (isOnline) {
         button.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
         button.classList.add('bg-primary', 'hover:bg-primary/80');
         button.removeAttribute('disabled');
         
         const textElement = button.querySelector('.connect-text, .join-text');
         if (textElement) {
           textElement.textContent = 'Join Now';
         }
       } else {
         button.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
         button.classList.remove('bg-primary', 'hover:bg-primary/80');
         button.setAttribute('disabled', 'true');
         
         const textElement = button.querySelector('.connect-text, .join-text');
         if (textElement) {
           textElement.textContent = 'Server Offline';
         }
       }
     });
   }

   function initializeCopyButtons() {
     const copyButtons = document.querySelectorAll('.copy-button, .copy-ip-footer');
     
     copyButtons.forEach(button => {
       // Önceki event listener'ları temizle
       const newButton = button.cloneNode(true);
       button.parentNode.replaceChild(newButton, button);
       
       newButton.addEventListener('click', async function() {
         const parentElement = this.closest('.flex');
         const contentElement = parentElement?.querySelector('.server-connection') || 
                              parentElement?.querySelector('code');
         
         if (contentElement) {
           try {
             await navigator.clipboard.writeText(contentElement.textContent.trim());
             showCopySuccess(this);
           } catch (err) {
             console.error('Kopyalama hatası:', err);
             showCopyError(this);
           }
         }
       });
     });
   }

   function showCopySuccess(button) {
     const originalIcon = button.querySelector('i').className;
     button.querySelector('i').className = 'fas fa-check text-[#10b981]';
     button.classList.add('scale-110');
     
     setTimeout(() => {
       button.querySelector('i').className = originalIcon;
       button.classList.remove('scale-110');
     }, 2000);
   }

   function showCopyError(button) {
     const originalIcon = button.querySelector('i').className;
     button.querySelector('i').className = 'fas fa-times text-red-500';
     button.classList.add('scale-110');
     
     setTimeout(() => {
       button.querySelector('i').className = originalIcon;
       button.classList.remove('scale-110');
     }, 2000);
   }

   function formatNumber(num) {
     if (num >= 1000) {
       return (num / 1000).toFixed(1) + 'K';
     }
     return num.toString();
   }

   document.addEventListener('DOMContentLoaded', () => {
     fetchServerDetails();
     setInterval(fetchServerDetails, 30000);
   });

   function initFeaturesSlider() {
     const slider = document.getElementById('featuresSlider');
     const dots = document.querySelectorAll('.features-dot');
     let currentSlide = 0;
     let slideInterval;
     const slideCount = Math.ceil(slider.children.length / 3); 
     const autoSlideDelay = 5000; 

     function updateSlider() {
       const slideWidth = slider.children[0].offsetWidth + 16; 
       slider.style.transform = `translateX(-${currentSlide * slideWidth * 3}px)`;

       dots.forEach((dot, index) => {
         if (index === currentSlide) {
           dot.classList.add('bg-white', 'scale-125');
           dot.classList.remove('bg-white/50');
         } else {
           dot.classList.remove('bg-white', 'scale-125');
           dot.classList.add('bg-white/50');
         }
       });
     }

     function nextSlide() {
       currentSlide = (currentSlide + 1) % slideCount;
       updateSlider();
     }

     function startAutoSlide() {
       if (slideInterval) clearInterval(slideInterval);
       slideInterval = setInterval(nextSlide, autoSlideDelay);
     }

     function stopAutoSlide() {
       if (slideInterval) {
         clearInterval(slideInterval);
       }
     }

     dots.forEach((dot, index) => {
       dot.addEventListener('click', () => {
         currentSlide = index;
         updateSlider();
         stopAutoSlide();
         startAutoSlide();
       });
     });

     startAutoSlide();

     slider.parentElement.addEventListener('mouseenter', stopAutoSlide);
     slider.parentElement.addEventListener('mouseleave', startAutoSlide);

     updateSlider();

     window.addEventListener('resize', updateSlider);
   }

   document.addEventListener('DOMContentLoaded', () => {
     initFeaturesSlider();
     // ... existing initialization code ...
   });

   function initGalleryFunctions() {
     const filterButtons = document.querySelectorAll('.filter-btn');
     const galleryItems = document.querySelectorAll('.gallery-item');
     const gallerySlider = document.getElementById('gallerySlider');
     const filteredGallery = document.getElementById('filteredGallery');
     let currentIndex = 0;
     let autoSlideInterval;

     function initializeSlider() {
       if (!gallerySlider) return;

       const sliderContainer = gallerySlider.parentElement;
       if (sliderContainer) {
         sliderContainer.style.overflow = 'hidden';
         sliderContainer.style.position = 'relative';
       }

       gallerySlider.style.display = 'flex';
       gallerySlider.style.transition = 'transform 0.5s ease';
       gallerySlider.style.gap = '1rem';

       Array.from(gallerySlider.children).forEach(item => {
         item.style.flex = '0 0 calc(25% - 0.75rem)';
         item.style.minWidth = 'calc(25% - 0.75rem)';
         item.style.position = 'relative';
         item.style.transition = 'all 0.3s ease';
       });

       updateSlider();
       startAutoSlide();
     }

     function updateSlider() {
       if (!gallerySlider) return;
       const slideWidth = 25; 
       const translateX = -currentIndex * slideWidth;
       gallerySlider.style.transform = `translateX(${translateX}%)`;
     }

     function startAutoSlide() {
       if (autoSlideInterval) clearInterval(autoSlideInterval);
       autoSlideInterval = setInterval(() => {
         const totalSlides = Array.from(gallerySlider.children).filter(item => item.style.display !== 'none').length;
         if (totalSlides > 4) {
           currentIndex = (currentIndex + 1) % (totalSlides - 3);
           updateSlider();
         }
       }, 4000);
     }

     filterButtons.forEach(button => {
       button.addEventListener('click', () => {
         filterButtons.forEach(btn => {
           btn.classList.remove('active', 'bg-primary', 'text-white');
           btn.classList.add('bg-dark-light', 'hover:bg-primary/20');
         });
         button.classList.add('active', 'bg-primary', 'text-white');
         button.classList.remove('bg-dark-light', 'hover:bg-primary/20');
         const filterValue = button.getAttribute('data-filter');
         if (gallerySlider) {
           currentIndex = 0; 
           Array.from(gallerySlider.children).forEach(item => {
             if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
               item.style.display = '';
             } else {
               item.style.display = 'none';
             }
           });
           updateSlider();
           startAutoSlide();
         }
         galleryItems.forEach(item => {
           if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
             item.style.display = 'block';
           } else {
             item.style.display = 'none';
           }
         });
         if (filteredGallery) {
           if (filterValue === 'all') {
             filteredGallery.classList.add('hidden');
             if (gallerySlider) gallerySlider.parentElement.classList.remove('hidden');
           } else {
             filteredGallery.classList.remove('hidden');
             if (gallerySlider) gallerySlider.parentElement.classList.add('hidden');
           }
         }
       });
     });

     let isDragging = false;
     let startPos = 0;
     let currentTranslate = 0;

     function touchStart(event) {
       if (!gallerySlider) return;
       isDragging = true;
       startPos = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
       gallerySlider.style.cursor = 'grabbing';
       gallerySlider.style.transition = 'none';
       if (autoSlideInterval) clearInterval(autoSlideInterval);
     }

     function touchMove(event) {
       if (!isDragging) return;
       const currentPos = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
       const diff = currentPos - startPos;
       const translateX = -currentIndex * 25 + (diff / gallerySlider.offsetWidth) * 100;
       gallerySlider.style.transform = `translateX(${translateX}%)`;
     }

     function touchEnd(event) {
       if (!isDragging) return;
       isDragging = false;
       gallerySlider.style.cursor = 'grab';
       gallerySlider.style.transition = 'transform 0.5s ease';
       
       const endPos = event.type.includes('mouse') ? event.pageX : event.changedTouches[0].clientX;
       const diff = endPos - startPos;
       const threshold = gallerySlider.offsetWidth * 0.2;

       if (Math.abs(diff) > threshold) {
         if (diff > 0 && currentIndex > 0) {
           currentIndex--;
         } else if (diff < 0 && currentIndex < Array.from(gallerySlider.children).filter(item => item.style.display !== 'none').length - 4) {
           currentIndex++;
         }
       }

       updateSlider();
       startAutoSlide();
     }

     if (gallerySlider) {
       gallerySlider.addEventListener('touchstart', touchStart);
       gallerySlider.addEventListener('touchmove', touchMove);
       gallerySlider.addEventListener('touchend', touchEnd);

       gallerySlider.addEventListener('mousedown', touchStart);
       gallerySlider.addEventListener('mousemove', touchMove);
       gallerySlider.addEventListener('mouseup', touchEnd);
       gallerySlider.addEventListener('mouseleave', touchEnd);

       initializeSlider();
     }

     const allButton = document.querySelector('.filter-btn[data-filter="all"]');
     if (allButton) {
       allButton.classList.add('active', 'bg-primary', 'text-white');
       allButton.classList.remove('bg-dark-light', 'hover:bg-primary/20');
     }
   }

   initGalleryFunctions();

   function initImageModal() {
     const modal = document.getElementById('mediaModal');
     const modalContent = document.getElementById('modalContent');
     const modalCaption = document.getElementById('modalCaption');
     const prevButton = document.getElementById('prevButton');
     const nextButton = document.getElementById('nextButton');
     
     let currentImageIndex = 0;
     let galleryImages = [];
     let currentRotation = 0;

     function updateGalleryImages() {
       const visibleSliderItems = Array.from(document.querySelectorAll('#gallerySlider > div:not([style*="display: none"])'));
       const visibleGridItems = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
       galleryImages = [...visibleSliderItems, ...visibleGridItems];
     }

     document.querySelectorAll('#gallerySlider > div, .gallery-item').forEach(item => {
       item.addEventListener('click', () => {
         updateGalleryImages();
         currentImageIndex = galleryImages.indexOf(item);
         openModal(item);
       });
     });

     function openModal(item) {
       const img = item.querySelector('img');
       const title = item.querySelector('h3')?.textContent || '';
       const description = item.querySelector('p')?.textContent || '';
       currentRotation = 0;

       modalContent.innerHTML = `
         <img src="${img.src}" alt="${img.alt}" class="max-h-[70vh] w-auto rounded-lg shadow-2xl transition-all duration-300" style="transform: rotate(${currentRotation}deg)">
       `;
       
       modalCaption.innerHTML = `
         <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
         <p class="text-gray-300">${description}</p>
       `;

       // Klavye kısayolları bilgisi
       const keyboardInfoDiv = modal.querySelector('.keyboard-info');
       if (keyboardInfoDiv) {
         keyboardInfoDiv.innerHTML = `
           <div class="bg-[#1e293b] bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
             <span class="mr-4">
               <i class="fas fa-arrow-left mr-2"></i>
               <i class="fas fa-arrow-right"></i>
               Gezinme
             </span>
             <span>
               <i class="fas fa-arrow-up mr-2"></i>
               <i class="fas fa-arrow-down"></i>
               Döndürme
             </span>
           </div>
         `;
       }

       modal.classList.remove('hidden');
       document.body.style.overflow = 'hidden';

       prevButton.style.display = currentImageIndex > 0 ? 'block' : 'none';
       nextButton.style.display = currentImageIndex < galleryImages.length - 1 ? 'block' : 'none';
     }

     function closeModal() {
       modal.classList.add('hidden');
       document.body.style.overflow = '';
       currentRotation = 0;
     }

     function rotateImage(direction) {
       const img = modalContent.querySelector('img');
       if (!img) return;

       currentRotation += direction === 'up' ? 90 : -90;
       img.style.transform = `rotate(${currentRotation}deg)`;
     }

     function showNextImage(fast = false) {
       if (currentImageIndex < galleryImages.length - 1) {
         currentImageIndex++;
         const nextItem = galleryImages[currentImageIndex];
         if (fast) {
           modalContent.style.transition = 'all 0.15s ease-in-out';
         }
         openModal(nextItem);
         setTimeout(() => {
           modalContent.style.transition = '';
         }, 150);
       }
     }

     function showPrevImage(fast = false) {
       if (currentImageIndex > 0) {
         currentImageIndex--;
         const prevItem = galleryImages[currentImageIndex];
         if (fast) {
           modalContent.style.transition = 'all 0.15s ease-in-out';
         }
         openModal(prevItem);
         setTimeout(() => {
           modalContent.style.transition = '';
         }, 150);
       }
     }

     // Event Listeners
     modal.addEventListener('click', (e) => {
       if (!e.target.closest('#modalContent') && !e.target.closest('#prevButton') && !e.target.closest('#nextButton')) {
         closeModal();
       }
     });

     prevButton.addEventListener('click', (e) => {
       e.stopPropagation();
       showPrevImage();
     });

     nextButton.addEventListener('click', (e) => {
       e.stopPropagation();
       showNextImage();
     });

     // Keyboard Navigation
     document.addEventListener('keydown', (e) => {
       if (!modal.classList.contains('hidden')) {
         switch(e.key) {
           case 'Escape':
             closeModal();
             break;
           case 'ArrowRight':
             e.shiftKey ? showNextImage(true) : showNextImage();
             break;
           case 'ArrowLeft':
             e.shiftKey ? showPrevImage(true) : showPrevImage();
             break;
           case 'ArrowUp':
             e.preventDefault();
             rotateImage('up');
             break;
           case 'ArrowDown':
             e.preventDefault();
             rotateImage('down');
             break;
         }
       }
     });

     // Update gallery images when filter changes
     document.querySelectorAll('.filter-btn').forEach(button => {
       button.addEventListener('click', () => {
         setTimeout(updateGalleryImages, 100);
       });
     });
   }

   // Initialize image modal
   initImageModal();
 })();
 
