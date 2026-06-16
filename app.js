document.addEventListener('DOMContentLoaded', () => {
    // Check if configuration exists, otherwise fallback to basic dummy data
    const config = window.WEBSITE_CONFIG || {
        storeInfo: { name: "Gemella", tagline: "Everything for String Players" },
        products: []
    };

    // State Variables
    const wishlist = new Set();
    const cart = []; // Array of { product, quantity }
    let activeFilter = 'all';

    // Initialize layout, items, and event handlers
    initLayout(config);
    initInteractiveEvents(config);
    initScrollReveal();

    // 1. DYNAMIC RENDER FUNCTIONS
    function initLayout(cfg) {
        // --- Top Bar ---
        const topBar = document.getElementById('top-bar-container');
        if (topBar && cfg.storeInfo) {
            topBar.innerHTML = `
                <span>${cfg.storeInfo.topBarMessage}</span>
                <span>${cfg.storeInfo.contactMessage}</span>
            `;
        }

        // --- Logo Info ---
        const logoTitle = document.getElementById('logo-title');
        const logoSub = document.getElementById('logo-sub');
        if (logoTitle) logoTitle.textContent = cfg.storeInfo.name;
        if (logoSub) logoSub.textContent = cfg.storeInfo.tagline;

        // --- Navigation Menu ---
        const navMenu = document.getElementById('nav-menu-container');
        if (navMenu && cfg.categories) {
            let navHtml = cfg.categories.slice(0, 6).map(cat => `
                <li class="nav-item">
                    <a href="#product-grid" class="nav-link nav-item-link" data-filter="${cat.filter}">${cat.name}s</a>
                </li>
            `).join('');
            navHtml += `
                <li class="nav-item">
                    <a href="#product-grid" class="nav-link nav-item-link sale-link" data-filter="sale">🔥 Sale</a>
                </li>
            `;
            navMenu.innerHTML = navHtml;
        }

        // --- Hero Section ---
        const heroContent = document.getElementById('hero-content-container');
        const heroStats = document.getElementById('hero-stats-container');
        if (heroContent && cfg.hero) {
            heroContent.innerHTML = `
                <div class="hero-badge reveal delay-1">${cfg.hero.badge}</div>
                <h1 class="hero-title reveal delay-2">${cfg.hero.title}</h1>
                <p class="hero-subtitle reveal delay-3">${cfg.hero.subtitle}</p>
                <div class="hero-actions d-flex gap-2 flex-wrap reveal delay-4">
                    <a href="${cfg.hero.primaryBtn.link}" class="btn btn-primary">${cfg.hero.primaryBtn.text}</a>
                    <a href="${cfg.hero.secondaryBtn.link}" class="btn btn-outline-white">${cfg.hero.secondaryBtn.text}</a>
                </div>
            `;
        }
        if (heroStats && cfg.hero && cfg.hero.stats) {
            heroStats.innerHTML = cfg.hero.stats.map((stat, idx) => `
                <div class="stat-card w-100 reveal delay-${idx + 1}">
                    <span class="stat-emoji">${stat.emoji}</span>
                    <div class="stat-info">
                        <div class="stat-label">${stat.label}</div>
                        <div class="stat-count">${stat.count}</div>
                    </div>
                </div>
            `).join('');
        }

        // --- Trust Badges ---
        const trustBadges = document.getElementById('trust-badges-container');
        if (trustBadges && cfg.trustBadges) {
            trustBadges.innerHTML = cfg.trustBadges.map(badge => `
                <div class="trust-badge-item">
                    <i class="ti ${badge.icon}" aria-hidden="true"></i>
                    <span>${badge.text}</span>
                </div>
            `).join('');
        }

        // --- Categories Grid ---
        const categoriesContainer = document.getElementById('categories-container');
        if (categoriesContainer && cfg.categories) {
            categoriesContainer.innerHTML = cfg.categories.map((cat, idx) => `
                <div class="col reveal delay-${(idx % 4) + 1}">
                    <div class="category-card" data-filter="${cat.filter}">
                        <div class="category-emoji">${cat.emoji}</div>
                        <div class="category-name">${cat.name}</div>
                    </div>
                </div>
            `).join('');
        }

        // --- Filter Tabs (Products) ---
        const filterTabs = document.getElementById('filter-tabs-container');
        if (filterTabs) {
            const tabs = [
                { id: 'all', label: 'All' },
                { id: 'new', label: 'New' },
                { id: 'sale', label: 'Sale' },
                { id: 'best', label: 'Best sellers' }
            ];
            filterTabs.innerHTML = tabs.map(t => `
                <button class="filter-tab ${t.id === activeFilter ? 'active' : ''}" id="f-${t.id}" data-tag="${t.id}">
                    ${t.label}
                </button>
            `).join('');
        }

        // --- Render Products Grid ---
        renderProducts(cfg.products, activeFilter);

        // --- Promo Banners ---
        const promosContainer = document.getElementById('promos-container');
        if (promosContainer && cfg.promoBanners) {
            promosContainer.innerHTML = cfg.promoBanners.map((promo, idx) => {
                const colClass = (idx === 2) ? 'col-12' : 'col-md-6';
                
                let imagesHtml = '';
                if (promo.images && promo.images.length > 0) {
                    imagesHtml = `
                        <div class="d-flex gap-3 flex-wrap mt-3 mt-md-0 justify-content-start align-items-center">
                            ${promo.images.map(img => `
                                <div style="position: relative; width: 110px; height: 110px; border-radius: 12px; overflow: hidden; border: 3px solid rgba(255,255,255,0.4); box-shadow: var(--shadow-md); transition: var(--transition-bounce);" class="promo-img-wrapper">
                                    <img src="${img}" alt="Adoption Cat" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                if (idx === 2) {
                    return `
                        <div class="${colClass} reveal delay-${idx + 1}">
                            <div class="promo-card h-100 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4" style="background: ${promo.gradient}">
                                <div style="flex: 1.2; max-width: 650px;">
                                    <div class="promo-emoji">${promo.emoji}</div>
                                    <h3 class="promo-title">${promo.title}</h3>
                                    <p class="promo-text mb-0">${promo.subtitle}</p>
                                </div>
                                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-4" style="flex: 0.8;">
                                    ${imagesHtml}
                                    <a href="${promo.btnLink}" class="btn btn-outline-white shrink-0" style="padding: 10px 24px; font-size: 14px;">${promo.btnText}</a>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="${colClass} reveal delay-${idx + 1}">
                            <div class="promo-card h-100 d-flex flex-column justify-content-between" style="background: ${promo.gradient}">
                                <div>
                                    <div class="promo-emoji">${promo.emoji}</div>
                                    <h3 class="promo-title">${promo.title}</h3>
                                    <p class="promo-text">${promo.subtitle}</p>
                                </div>
                                <div>
                                    <a href="${promo.btnLink}" class="btn btn-outline-white" style="padding: 8px 20px; font-size: 13px;">${promo.btnText}</a>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }).join('');
        }

        // --- Authorized Brands ---
        const brandsContainer = document.getElementById('brands-container');
        if (brandsContainer && cfg.brands) {
            brandsContainer.innerHTML = cfg.brands.map((brand, idx) => `
                <div class="brand-chip reveal delay-${(idx % 4) + 1}">${brand}</div>
            `).join('');
        }

        // --- Newsletter Section ---
        const newsletterContainer = document.getElementById('newsletter-container');
        if (newsletterContainer && cfg.newsletter) {
            newsletterContainer.innerHTML = `
                <div class="container reveal">
                    <h2 class="newsletter-title">${cfg.newsletter.title}</h2>
                    <p class="newsletter-subtitle">${cfg.newsletter.subtitle}</p>
                    <form class="newsletter-form d-flex flex-column flex-sm-row gap-2" id="newsletter-form">
                        <input type="email" class="newsletter-input" placeholder="${cfg.newsletter.placeholder}" required>
                        <button type="submit" class="btn btn-primary" style="white-space: nowrap;">${cfg.newsletter.buttonText}</button>
                    </form>
                </div>
            `;
        }

        // --- Footer Info ---
        const footerLogoName = document.getElementById('footer-logo-name');
        const footerAbout = document.getElementById('footer-about-text');
        const footerSocials = document.getElementById('footer-socials');
        const footerContactInfo = document.getElementById('footer-contact-info');
        const footerCopyright = document.getElementById('footer-copyright');

        if (footerLogoName && cfg.storeInfo) footerLogoName.textContent = cfg.storeInfo.name;
        if (footerAbout && cfg.footer) footerAbout.textContent = cfg.footer.aboutText;
        
        if (footerSocials && cfg.footer && cfg.footer.socials) {
            footerSocials.innerHTML = cfg.footer.socials.map(soc => `
                <a href="#" class="social-icon" aria-label="${soc.platform}">
                    <i class="ti ${soc.icon}" aria-hidden="true"></i>
                </a>
            `).join('');
        }

        if (footerContactInfo && cfg.storeInfo) {
            footerContactInfo.innerHTML = `
                <div class="footer-contact-item">
                    <i class="ti ti-map-pin" aria-hidden="true"></i>
                    <span>123 Sukhumvit Rd, Bangkok 10110</span>
                </div>
                <div class="footer-contact-item">
                    <i class="ti ti-phone" aria-hidden="true"></i>
                    <span>${cfg.storeInfo.phone}</span>
                </div>
                <div class="footer-contact-item">
                    <i class="ti ti-mail" aria-hidden="true"></i>
                    <span>info@${cfg.storeInfo.name.toLowerCase()}.th</span>
                </div>
                <div class="footer-contact-item">
                    <i class="ti ti-clock" aria-hidden="true"></i>
                    <span>${cfg.storeInfo.hours}</span>
                </div>
            `;
        }

        if (footerCopyright && cfg.storeInfo) {
            const currentYear = new Date().getFullYear();
            footerCopyright.textContent = `© ${currentYear} ${cfg.storeInfo.name} Fine Strings. All rights reserved.`;
        }
    }

    // 2. PRODUCT RENDERING METHOD
    function renderProducts(productList, filterTag, searchKeyword = '') {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        // Apply filters & Search keywords
        let filtered = productList;
        if (filterTag !== 'all') {
            filtered = productList.filter(p => p.tag === filterTag || p.category === filterTag);
        }
        if (searchKeyword.trim() !== '') {
            const kw = searchKeyword.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(kw) || 
                p.brand.toLowerCase().includes(kw) ||
                p.category.toLowerCase().includes(kw)
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="w-100 text-center py-5 reveal" style="grid-column: 1/-1; color: var(--color-text-secondary);">
                    <i class="ti ti-mood-empty" style="font-size: 48px; opacity: 0.5; margin-bottom: 12px; display: block;"></i>
                    <p class="fs-5 fw-medium">No instruments found matching details.</p>
                    <button class="btn btn-outline mt-3 btn-sm" id="reset-search-btn">Reset Filters</button>
                </div>
            `;
            initScrollReveal();
            return;
        }

        const tagColors = { new: 'badge-new', sale: 'badge-sale', best: 'badge-hot' };
        const tagLabels = { new: 'New', sale: 'Sale', best: '⭐ Best' };

        grid.innerHTML = filtered.map((p, index) => {
            const isWishlisted = wishlist.has(p.name);
            const badgeClass = tagColors[p.tag] || 'badge-new';
            const badgeLabel = tagLabels[p.tag] || p.tag;
            
            // Format currency in Baht
            const formattedPrice = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(p.price);
            const formattedOldPrice = p.oldPrice ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(p.oldPrice) : null;

            const isRealImage = p.image && (p.image.startsWith('images/') || p.image.includes('.'));
            const imageHtml = isRealImage 
                ? `<img src="${p.image}" alt="${p.name}" class="product-card-img" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; transition: transform 0.4s ease;">` 
                : `<i class="ti ti-music" aria-hidden="true" style="font-size: 48px; color: var(--color-accent); opacity: 0.85;"></i>
                   <span style="font-size: 18px; font-weight: 700; color: var(--color-primary);">${p.image}</span>`;

            return `
                <div class="col reveal delay-${(index % 4) + 1}">
                    <div class="product-card h-100" data-category="${p.category}">
                        <div class="card-media-wrapper">
                            <div class="product-image-container">
                                ${imageHtml}
                            </div>
                            <div class="card-badges">
                                ${p.tag ? `<span class="badge ${badgeClass}">${badgeLabel}</span>` : ''}
                            </div>
                            <button class="wishlist-toggle" data-name="${p.name}" aria-label="Toggle wishlist">
                                ${isWishlisted ? '❤️' : '🤍'}
                            </button>
                            ${!p.stock ? `<div class="out-of-stock-overlay">Out of stock</div>` : ''}
                        </div>
                        <div class="product-details d-flex flex-column justify-content-between">
                            <div>
                                <div class="product-brand">${p.brand}</div>
                                <h3 class="product-name-text">${p.name}</h3>
                                <div class="product-pricing">
                                    <span class="price-current">${formattedPrice}</span>
                                    ${p.oldPrice ? `<span class="price-old">${formattedOldPrice}</span>` : ''}
                                </div>
                            </div>
                            <button class="card-btn add-to-cart-btn" data-name="${p.name}" ${!p.stock ? 'disabled' : ''}>
                                ${p.stock ? 'Add to cart' : 'Notify me'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Apply scroll reveal animations to newly injected cards
        initScrollReveal();
    }

    // 3. CART DRAWER HANDLER FUNCTIONS
    function openCartDrawer() {
        document.getElementById('cart-drawer').classList.add('show');
        document.getElementById('cart-drawer-overlay').classList.add('show');
    }

    function closeCartDrawer() {
        document.getElementById('cart-drawer').classList.remove('show');
        document.getElementById('cart-drawer-overlay').classList.remove('show');
    }

    function addToCart(productName) {
        const item = config.products.find(p => p.name === productName);
        if (!item) return;

        const cartItemIndex = cart.findIndex(c => c.product.name === productName);
        if (cartItemIndex > -1) {
            cart[cartItemIndex].quantity += 1;
        } else {
            cart.push({ product: item, quantity: 1 });
        }

        renderCart();
        openCartDrawer();
        showToast(`🛒 Added "${productName}" to your cart!`);
    }

    function removeFromCart(productName) {
        const cartItemIndex = cart.findIndex(c => c.product.name === productName);
        if (cartItemIndex > -1) {
            cart.splice(cartItemIndex, 1);
        }
        renderCart();
        showToast(`Removed item from cart`);
    }

    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-drawer-items');
        const cartCounter = document.getElementById('cart-counter');
        const cartSubtotal = document.getElementById('cart-subtotal');
        if (!cartItemsContainer) return;

        // Calculate count
        let totalCount = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5 text-muted">
                    <i class="ti ti-shopping-cart-x" style="font-size: 48px; opacity: 0.4; margin-bottom: 12px;"></i>
                    <p class="mb-0">Your shopping cart is empty.</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => {
                totalCount += item.quantity;
                totalPrice += item.product.price * item.quantity;
                
                const itemFormattedPrice = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(item.product.price * item.quantity);

                const isItemRealImage = item.product.image && (item.product.image.startsWith('images/') || item.product.image.includes('.'));
                const itemImageHtml = isItemRealImage
                    ? `<img src="${item.product.image}" alt="${item.product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius-sm);">`
                    : item.product.image;

                return `
                    <div class="cart-item">
                        <div class="cart-item-image">${itemImageHtml}</div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-name">${item.product.name}</h4>
                            <div class="d-flex justify-content-between align-items-center mt-1">
                                <span class="text-muted text-xs">Qty: ${item.quantity}</span>
                                <span class="cart-item-price">${itemFormattedPrice}</span>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-name="${item.product.name}" aria-label="Remove item">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }

        // Update counter & subtotal
        if (cartCounter) {
            cartCounter.textContent = totalCount;
            cartCounter.style.transform = 'scale(1.3)';
            setTimeout(() => cartCounter.style.transform = 'none', 300);
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(totalPrice);
        }
    }

    // 4. SEARCH MODAL OVERLAY HANDLERS
    function openSearchOverlay() {
        const searchOverlay = document.getElementById('search-overlay');
        searchOverlay.classList.add('show');
        const input = document.getElementById('search-overlay-input');
        if (input) {
            setTimeout(() => input.focus(), 250);
        }
    }

    function closeSearchOverlay() {
        document.getElementById('search-overlay').classList.remove('show');
    }

    // 5. INTERACTIVE EVENTS AND LISTENERS
    function initInteractiveEvents(cfg) {
        // --- Click listener for action triggers ---
        document.body.addEventListener('click', (e) => {
            // Cart drawer toggle clicks
            if (e.target.closest('[aria-label="Cart"]')) {
                e.preventDefault();
                openCartDrawer();
            }
            if (e.target.id === 'cart-drawer-close' || e.target.id === 'cart-drawer-overlay') {
                closeCartDrawer();
            }

            // Cart item remove click
            const removeBtn = e.target.closest('.cart-item-remove');
            if (removeBtn) {
                removeFromCart(removeBtn.getAttribute('data-name'));
            }

            // Search open/close clicks
            if (e.target.closest('[aria-label="Search"]')) {
                e.preventDefault();
                openSearchOverlay();
            }
            if (e.target.id === 'search-overlay-close' || e.target.id === 'search-overlay') {
                if (e.target.id === 'search-overlay-input') return; // Don't close when typing
                closeSearchOverlay();
            }

            // Search popular tag click
            if (e.target.classList.contains('search-pop-tag')) {
                const tag = e.target.textContent;
                const searchInput = document.getElementById('search-overlay-input');
                if (searchInput) {
                    searchInput.value = tag;
                    document.getElementById('search-overlay-form').dispatchEvent(new Event('submit'));
                }
            }

            // Add to Cart card button
            if (e.target.classList.contains('add-to-cart-btn')) {
                const prodName = e.target.getAttribute('data-name');
                addToCart(prodName);
            }

            // Reset filters click
            if (e.target.id === 'reset-search-btn') {
                activeFilter = 'all';
                document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
                document.getElementById('f-all').classList.add('active');
                renderProducts(cfg.products, 'all');
            }

            // Filter tabs click
            if (e.target.classList.contains('filter-tab')) {
                const tag = e.target.getAttribute('data-tag');
                activeFilter = tag;
                
                document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                renderProducts(cfg.products, activeFilter);
            }

            // Category card click
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const filter = categoryCard.getAttribute('data-filter');
                activeFilter = filter;
                
                document.getElementById('product-grid').scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
                
                renderProducts(cfg.products, activeFilter);
                showToast(`Filtered by Category: ${filter.toUpperCase()}`);
            }

            // Nav link click
            if (e.target.classList.contains('nav-item-link')) {
                const filter = e.target.getAttribute('data-filter');
                activeFilter = filter;
                
                const navbarCollapse = document.getElementById('navbarContent');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) bsCollapse.hide();
                    else new bootstrap.Collapse(navbarCollapse).hide();
                }

                document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
                renderProducts(cfg.products, activeFilter);
            }

            // Wishlist Toggle click
            if (e.target.classList.contains('wishlist-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                const prodName = e.target.getAttribute('data-name');
                if (wishlist.has(prodName)) {
                    wishlist.delete(prodName);
                    e.target.textContent = '🤍';
                    showToast(`Removed "${prodName}" from wishlist`);
                } else {
                    wishlist.add(prodName);
                    e.target.textContent = '❤️';
                    showToast(`Added "${prodName}" to wishlist! ❤️`);
                }
            }

            // Checkout button click
            if (e.target.id === 'checkout-btn') {
                if (cart.length === 0) {
                    showToast("Your cart is empty!");
                    return;
                }
                showToast("🎉 Order placed successfully! Thank you for choosing Gemella.");
                cart.length = 0; // Clear cart
                renderCart();
                closeCartDrawer();
            }

            // Social links click
            if (e.target.closest('.social-icon')) {
                e.preventDefault();
                showToast("Opening social media profile...");
            }
        });

        // --- Search overlay form submit listener ---
        const searchForm = document.getElementById('search-overlay-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const keyword = document.getElementById('search-overlay-input').value;
                closeSearchOverlay();
                renderProducts(cfg.products, 'all', keyword);
                
                // Scroll to results
                const targetGrid = document.getElementById('product-grid');
                if (targetGrid) {
                    targetGrid.scrollIntoView({ behavior: 'smooth' });
                }
                showToast(`Showing results for "${keyword}"`);
            });
        }

        // --- Keyboard shortcuts (Escape key closes overlays) ---
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCartDrawer();
                closeSearchOverlay();
            }
        });

        // --- Card cursor-glow mousemove listener ---
        document.body.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.product-card, .category-card');
            if (card) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });

        // --- Newsletter Submission ---
        document.body.addEventListener('submit', (e) => {
            if (e.target.id === 'newsletter-form') {
                e.preventDefault();
                const emailInput = e.target.querySelector('.newsletter-input');
                if (emailInput) {
                    showToast(`🎉 Thank you! Subscribed ${emailInput.value} to our mailing list.`);
                    emailInput.value = '';
                }
            }
        });
    }

    // 6. INTERSECTION OBSERVER FOR SCROLL REVEALS
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px' // Trigger slightly before element enters
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing once animated in
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }

    // 7. ANIMATED TOAST NOTIFICATION UTILITY
    function showToast(message) {
        const existingToast = document.querySelector('.toast-msg');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<i class="ti ti-bell-ringing" aria-hidden="true" style="color: var(--color-accent);"></i> ${message}`;

        document.body.appendChild(toast);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.style.animation = 'none';
            toast.offsetHeight; // force repaint
            toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
});
