// JISP Talk Community Core Application
document.addEventListener('DOMContentLoaded', () => {
    console.log("JISP Talk Initialized.");

    // DOM Nodes
    const premiumBtn = document.getElementById('portal-premium-btn');
    const paymentOverlay = document.getElementById('jisp-payment-overlay');
    const closeBtn = document.getElementById('jisp-payment-close');
    const submitBtn = document.getElementById('jisp-pay-submit-btn');
    const paymentBtns = document.querySelectorAll('.jisp-payment-btn');

    // Auth DOM Nodes
    const authBtn = document.getElementById('portal-auth-btn');
    const authOverlay = document.getElementById('jisp-auth-overlay');
    const authClose = document.getElementById('jisp-auth-close');
    const authSubmit = document.getElementById('jisp-auth-submit-btn');
    const authUsernameGroup = document.getElementById('auth-username-group');
    const authUsernameInput = document.getElementById('auth-username-input');
    const authEmailInput = document.getElementById('auth-email-input');
    const authPasswordInput = document.getElementById('auth-password-input');
    const authSwitchAction = document.getElementById('auth-switch-action');
    const authSwitchPrompt = document.getElementById('auth-switch-prompt');
    const authHeaderTitle = document.getElementById('auth-modal-header-title');
    const authPostOverlay = document.getElementById('auth-post-overlay');

    // App DOM Nodes
    const postsContainer = document.getElementById('posts-container');
    const postTitleInput = document.getElementById('post-title');
    const postContentInput = document.getElementById('post-content');
    const postTickerSelect = document.getElementById('post-ticker');
    const postSubmitBtn = document.getElementById('post-submit');
    const feedSearchInput = document.getElementById('feed-search');
    const feedSortSelect = document.getElementById('feed-sort');
    const menuItems = document.querySelectorAll('.menu-item');
    const trendingList = document.getElementById('trending-tickers-list');

    let authMode = 'login';
    let currentCategory = 'all';
    let searchQuery = '';
    let sortMode = 'hot';

    // ─── INITIAL MOCK POSTS DATABASE ────────────────────────
    let posts = [
        {
            id: 'post_1',
            author: 'Warren_Buffett',
            badge: 'admin',
            title: 'NVDA의 밸류에이션에 대한 고찰',
            content: 'NVIDIA는 현재 AI 가속기 칩 분야에서 독보적인 해자(Moat)를 보유하고 있습니다. 그러나 액면분할 이후 몰려든 개인투자자들의 과열 심리로 인해 단기 PER이 상당히 가파르게 상승했습니다. 가치투자자 입장에서 마진을 꼼꼼히 확인하고 진입하는 것을 권장합니다.',
            ticker: 'NVDA',
            category: 'stocks',
            time: '10분 전',
            likes: 42,
            liked: false,
            comments: [
                { author: 'Jihoo Jung', text: '좋은 의견 감사드립니다. JISP 차트분석기로 보니 70점 중립 상태네요.' },
                { author: 'Jiseob Won', text: '역시 현인의 조언답습니다.' }
            ]
        },
        {
            id: 'post_2',
            author: 'Elon Musk',
            badge: 'pro',
            title: 'TSLA FSD v12.5 업데이트 공개 임박 🚀',
            content: '새로운 종단간(End-to-End) 신경망 FSD v12.5 버전이 곧 배포됩니다. 수백만 마일의 실제 운전 데이터를 학습하여 그 어떤 버전보다 매끄럽고 인간다운 자율주행을 보여줍니다. 테슬라는 단순 자동차 제조사가 아니라 에너지, AI, 로보틱스 기업입니다.',
            ticker: 'TSLA',
            category: 'stocks',
            time: '45분 전',
            likes: 128,
            liked: false,
            comments: [
                { author: 'StockKing', text: '테슬라 주가 300불 가즈아!' }
            ]
        },
        {
            id: 'post_3',
            author: 'Satoshi_Maxi',
            badge: 'user',
            title: '비트코인 반감기 이후 10만달러 목표가 유효할까요?',
            content: '반감기 공급 충격이 시장에 서서히 반영되기 시작했습니다. 각국 중앙은행의 유동성 완화 사이클과 기관 자금 유입세를 감안할 때, 연말 100K 도달은 수학적인 필연이라고 생각합니다. 지금 가격대는 강력한 매수 찬스입니다.',
            ticker: 'BTC',
            category: 'crypto',
            time: '2시간 전',
            likes: 73,
            liked: false,
            comments: [
                { author: 'GoldHedge', text: '금과 비트코인 둘 다 분할 매수 중입니다.' },
                { author: 'CryptoWhale', text: 'PEPE 코인도 슬슬 담아야죠.' }
            ]
        },
        {
            id: 'post_4',
            author: 'IndexHedge',
            badge: 'user',
            title: '안정적인 은퇴 포트폴리오로 SPY vs QQQ 비율 제안',
            content: '변동성을 이기기 어려운 분들은 무조건 SPY 70%, QQQ 30% 비율로 적립식 매수를 추천합니다. 배당 재투자까지 설정해 두면 10년 뒤 복리 효과에 깜짝 놀라실 겁니다.',
            ticker: 'SPY',
            category: 'etf',
            time: '5시간 전',
            likes: 19,
            liked: false,
            comments: []
        },
        {
            id: 'post_5',
            author: 'MemeGod99',
            badge: 'user',
            title: '페페코인(PEPE) 이번 주 상승 릴레이 시작한다 🐸',
            content: '트위터 센티먼트 지수 터졌습니다. 고래들 지갑에서 거래소 밖으로 출금하는 정황 포착! 밈코인 투자는 야수의 심장으로 하는 겁니다. 무지성 롱 가즈아!!!',
            ticker: 'PEPE',
            category: 'smallcaps',
            time: '12시간 전',
            likes: 95,
            liked: false,
            comments: [
                { author: 'GambleExpert', text: 'Infinity% 가보자고!' }
            ]
        }
    ];

    // Load persisted posts if any
    const localPosts = localStorage.getItem('jisp_community_posts');
    if (localPosts) {
        try {
            posts = JSON.parse(localPosts);
        } catch (e) {
            localStorage.setItem('jisp_community_posts', JSON.stringify(posts));
        }
    } else {
        localStorage.setItem('jisp_community_posts', JSON.stringify(posts));
    }

    // ─── SSO PROFILE & PREMIUM SYNC ────────────────────────
    const MOCK_AI_SIGNALS = [
        { ticker: 'NVDA', type: 'BUY', target: '$148.00', prob: '89%' },
        { ticker: 'BTC', type: 'BUY', target: '$76,500', prob: '92%' },
        { ticker: 'TSLA', type: 'SELL', target: '$190.00', prob: '78%' },
        { ticker: 'PEPE', type: 'BUY', target: '$0.000021', prob: '95%' },
        { ticker: 'SPY', type: 'BUY', target: '$565.00', prob: '84%' }
    ];

    function renderAISignals() {
        const listContainer = document.getElementById('ai-signal-list');
        if (!listContainer) return;
        listContainer.innerHTML = MOCK_AI_SIGNALS.map(s => {
            const badgeClass = s.type.toLowerCase();
            return `
                <div class="ai-signal-item">
                    <div>
                        <span class="ai-signal-ticker">${s.ticker}</span>
                        <span class="ai-signal-badge ${badgeClass}">${s.type}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: #fff;">${s.target}</div>
                        <div style="font-size: 10px; color: var(--text-muted);">확률 <span class="ai-signal-prob">${s.prob}</span></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function checkPremium() {
        if (localStorage.getItem('jisp_premium') === null) {
            localStorage.setItem('jisp_premium', 'false');
        }
        const isPremium = localStorage.getItem('jisp_premium') === 'true';
        if (isPremium) {
            if (premiumBtn) {
                premiumBtn.textContent = 'JISP Pro 회원';
                premiumBtn.classList.add('premium-active');
            }
            const lock = document.getElementById('ai-predictor-lock');
            if (lock) lock.style.display = 'none';
        } else {
            if (premiumBtn) {
                premiumBtn.textContent = 'JISP Pro 가입';
                premiumBtn.classList.remove('premium-active');
            }
            const lock = document.getElementById('ai-predictor-lock');
            if (lock) lock.style.display = 'flex';
        }
    }

    function checkAuth() {
        const userRaw = localStorage.getItem('jisp_user');
        const myPostsTab = document.getElementById('menu-item-my');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                authBtn.outerHTML = `<div id="portal-auth-profile" class="profile-card-nav">
                    <span>👤 ${user.username}</span>
                    <button class="logout-btn-nav" id="portal-logout-btn">로그아웃</button>
                </div>`;
                
                if (myPostsTab) myPostsTab.style.display = 'block';

                // Remove Post blocker overlay
                if (authPostOverlay) authPostOverlay.style.display = 'none';

                // Re-bind logout button
                document.getElementById('portal-logout-btn').addEventListener('click', () => {
                    localStorage.removeItem('jisp_user');
                    alert('로그아웃 되었습니다.');
                    location.reload();
                });
            } catch (e) {
                localStorage.removeItem('jisp_user');
            }
        } else {
            if (authPostOverlay) authPostOverlay.style.display = 'flex';
            if (myPostsTab) myPostsTab.style.display = 'none';
        }
    }

    // Auth toggle
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            authOverlay.classList.add('active');
        });
    }

    if (authClose) {
        authClose.addEventListener('click', () => {
            authOverlay.classList.remove('active');
        });
    }

    function handleAuthSwitch() {
        if (authMode === 'login') {
            authMode = 'register';
            authHeaderTitle.textContent = '회원가입';
            authUsernameGroup.style.display = 'flex';
            authSwitchPrompt.innerHTML = '이미 계정이 있으신가요? <span class="auth-switch-link" id="auth-switch-action">로그인</span>';
            authSubmit.textContent = '가입하기';
        } else {
            authMode = 'login';
            authHeaderTitle.textContent = '로그인';
            authUsernameGroup.style.display = 'none';
            authSwitchPrompt.innerHTML = '계정이 없으신가요? <span class="auth-switch-link" id="auth-switch-action">회원가입</span>';
            authSubmit.textContent = '로그인';
        }
        const nextBtn = document.getElementById('auth-switch-action');
        if (nextBtn) {
            nextBtn.addEventListener('click', handleAuthSwitch);
        }
    }

    if (authSwitchAction) {
        authSwitchAction.addEventListener('click', handleAuthSwitch);
    }

    authSubmit.addEventListener('click', () => {
        const email = authEmailInput.value.trim();
        const pw = authPasswordInput.value.trim();
        if (!email || !pw) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        authSubmit.textContent = authMode === 'login' ? '로그인 중...' : '회원가입 중...';
        authSubmit.disabled = true;

        setTimeout(() => {
            let registeredUsers = [];
            try {
                const raw = localStorage.getItem('jisp_registered_users');
                if (raw) registeredUsers = JSON.parse(raw);
            } catch (e) {
                registeredUsers = [];
            }

            if (authMode === 'register') {
                const username = authUsernameInput.value.trim() || 'User';
                const exists = registeredUsers.some(u => u.email === email);
                if (exists) {
                    alert('이미 가입된 이메일 주소입니다.');
                    authSubmit.disabled = false;
                    authSubmit.textContent = '가입하기';
                    return;
                }
                const newUser = { username, email, password: pw };
                registeredUsers.push(newUser);
                localStorage.setItem('jisp_registered_users', JSON.stringify(registeredUsers));

                const user = { username, email, loggedIn: true };
                localStorage.setItem('jisp_user', JSON.stringify(user));
                alert(`🎉 회원가입 완료! ${username}님 환영합니다.`);
            } else {
                const found = registeredUsers.find(u => u.email === email && u.password === pw);
                if (!found) {
                    alert('가입되지 않은 계정이거나 비밀번호가 일치하지 않습니다.');
                    authSubmit.disabled = false;
                    authSubmit.textContent = '로그인';
                    return;
                }
                const user = { username: found.username, email, loggedIn: true };
                localStorage.setItem('jisp_user', JSON.stringify(user));
                alert(`👋 환영합니다! ${found.username}님 로그인에 성공했습니다.`);
            }
            authOverlay.classList.remove('active');
            authSubmit.disabled = false;
            authSubmit.textContent = authMode === 'login' ? '로그인' : '가입하기';
            location.reload();
        }, 1000);
    });

    // Premium upgrade handlers
    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => {
            const isPremium = localStorage.getItem('jisp_premium') === 'true';
            if (isPremium) {
                if (confirm('JISP Pro 구독을 취소하시겠습니까? (테스트용)')) {
                    localStorage.setItem('jisp_premium', 'false');
                    checkPremium();
                    alert('구독이 취소되었습니다. (체험용)');
                }
            } else {
                paymentOverlay.classList.add('active');
            }
        });
    }

    if (closeBtn && paymentOverlay) {
        closeBtn.addEventListener('click', () => {
            paymentOverlay.classList.remove('active');
        });
    }

    if (paymentBtns) {
        paymentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                paymentBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    function sendDiscordWebhook(name, email) {
        const webhookUrl = localStorage.getItem('jisp_discord_webhook');
        if (!webhookUrl) return Promise.resolve();

        const payload = {
            username: "JISP 결제 알리미",
            embeds: [{
                title: "🔔 JISP Pro 새로운 입금 확인 신청!",
                color: 5814783,
                fields: [
                    { name: "👤 입금자명", value: name, inline: true },
                    { name: "📧 이메일", value: email, inline: true },
                    { name: "💰 신청 금액", value: "₩3,900", inline: true },
                    { name: "📅 신청 시간", value: new Date().toLocaleString("ko-KR"), inline: false }
                ],
                footer: { text: "JISP Payment System" }
            }]
        };

        return fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Discord Webhook Error:', err));
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('toss-sender-name');
            const emailInput = document.getElementById('toss-sender-email');
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            if (!name || !email) {
                alert('입금자명과 이메일 주소를 입력해주세요.');
                return;
            }
            
            submitBtn.textContent = '송금 입금 내역 확인 중...';
            submitBtn.disabled = true;

            localStorage.setItem('jisp_pay_origin', window.location.href);
            localStorage.setItem('jisp_current_pending_email', email);
            localStorage.setItem('jisp_premium', 'false');

            fetch('/api/payment/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            })
            .then(res => res.json())
            .then(() => {
                sendDiscordWebhook(name, email).then(() => {
                    setTimeout(() => {
                        window.location.replace('/payment/pending.html');
                    }, 1000);
                });
            })
            .catch(err => {
                console.error(err);
                alert('서버 통신 실패. 백엔드가 실행 중인지 확인하세요.');
                submitBtn.disabled = false;
                submitBtn.textContent = '송금 완료 확인 신청';
            });
        });
    }

    // ─── POSTS RENDER LOGIC ────────────────────────
    function renderPosts() {
        postsContainer.innerHTML = '';

        // Filter by category
        let filtered = posts;
        if (currentCategory === 'my') {
            const userRaw = localStorage.getItem('jisp_user');
            let username = 'You (Guest)';
            if (userRaw) {
                try { username = JSON.parse(userRaw).username || 'You (Guest)'; } catch {}
            }
            filtered = posts.filter(p => p.author === username);
        } else if (currentCategory !== 'all') {
            filtered = posts.filter(p => p.category === currentCategory);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.content.toLowerCase().includes(query) ||
                p.author.toLowerCase().includes(query) ||
                p.ticker.toLowerCase().includes(query)
            );
        }

        // Sort posts
        if (sortMode === 'hot') {
            filtered.sort((a, b) => b.likes - a.likes);
        } else {
            filtered.sort((a, b) => b.id.localeCompare(a.id)); // Newer post IDs are created descending
        }

        if (filtered.length === 0) {
            postsContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted); font-size: 13px;">일치하는 게시글이 없습니다. 첫 글을 작성해 보세요!</div>`;
            return;
        }

        filtered.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            // Build comments HTML
            const commentsHtml = post.comments.map(c => `
                <div class="comment-item">
                    <span class="comment-author">👤 ${c.author}:</span>
                    <span>${escapeHTML(c.text)}</span>
                </div>
            `).join('');

            postCard.innerHTML = `
                <div class="post-header">
                    <div class="post-user-info">
                        <span class="post-username">👤 ${post.author}</span>
                        <span class="post-badge ${post.badge}">${post.badge.toUpperCase()}</span>
                        <span class="post-time">${post.time}</span>
                    </div>
                    <span class="post-ticker-tag">${post.ticker}</span>
                </div>
                <div class="post-title">${escapeHTML(post.title)}</div>
                <div class="post-body">${escapeHTML(post.content)}</div>
                <div class="post-footer">
                    <button class="post-foot-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                        ❤️ <span>${post.likes}</span> 따봉
                    </button>
                    <button class="post-foot-btn" onclick="toggleCommentsSection('${post.id}')">
                        💬 <span>${post.comments.length}</span> 댓글
                    </button>
                </div>
                <div class="comments-section" id="comments-sec-${post.id}" style="display: block;">
                    <div class="comments-list">
                        ${commentsHtml || '<div style="font-size:11px; color:var(--text-muted); text-align:center; padding: 4px 0;">아직 댓글이 없습니다.</div>'}
                    </div>
                    <div class="comment-input-row">
                        <input type="text" placeholder="댓글을 입력하세요..." class="comment-input" id="comment-input-${post.id}">
                        <button class="comment-submit-btn" onclick="addComment('${post.id}')">등록</button>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postCard);
        });
    }

    // Escape HTML helper
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Toggle post like
    window.toggleLike = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (post.liked) {
            post.likes--;
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        localStorage.setItem('jisp_community_posts', JSON.stringify(posts));
        renderPosts();
    };

    // Toggle comments section visibility
    window.toggleCommentsSection = function(postId) {
        const sec = document.getElementById(`comments-sec-${postId}`);
        if (sec) {
            sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        }
    };

    // Add comment
    window.addComment = function(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        // Get current user details
        const userRaw = localStorage.getItem('jisp_user');
        let author = 'Anonymous';
        if (userRaw) {
            try {
                author = JSON.parse(userRaw).username;
            } catch(e) {}
        }

        post.comments.push({ author, text });
        localStorage.setItem('jisp_community_posts', JSON.stringify(posts));
        input.value = '';
        renderPosts();
    };

    // ─── POST CREATION ────────────────────────
    postSubmitBtn.addEventListener('click', () => {
        const userRaw = localStorage.getItem('jisp_user');
        if (!userRaw) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }

        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();
        const ticker = postTickerSelect.value;

        if (!title || !content) {
            alert('제목과 내용을 모두 작성해주세요.');
            return;
        }

        let author = 'User';
        let badge = 'user';
        try {
            const user = JSON.parse(userRaw);
            author = user.username;
            // Check premium for PRO badge in community
            const isPremium = localStorage.getItem('jisp_premium') === 'true';
            if (isPremium) badge = 'pro';
        } catch(e) {}

        const newPost = {
            id: 'post_' + Date.now(),
            author,
            badge,
            title,
            content,
            ticker,
            category: mapTickerToCategory(ticker),
            time: '방금 전',
            likes: 0,
            liked: false,
            comments: []
        };

        posts.unshift(newPost);
        localStorage.setItem('jisp_community_posts', JSON.stringify(posts));

        // Clear inputs
        postTitleInput.value = '';
        postContentInput.value = '';
        postTickerSelect.value = 'GENERAL';

        alert('게시글이 성공적으로 등록되었습니다!');
        renderPosts();
    });

    function mapTickerToCategory(ticker) {
        if (['SPY', 'QQQ'].includes(ticker)) return 'etf';
        if (['BTC', 'ETH'].includes(ticker)) return 'crypto';
        if (ticker === 'PEPE') return 'smallcaps';
        if (ticker === 'GENERAL') return 'all';
        return 'stocks';
    }

    // Toolbar filters
    feedSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderPosts();
    });

    feedSortSelect.addEventListener('change', (e) => {
        sortMode = e.target.value;
        renderPosts();
    });

    // Category Tabs Filtering
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderPosts();
        });
    });

    // ─── REAL-TIME TRENDING ASSETS SIDEBAR ───
    let trendingTickers = [
        { ticker: 'NVDA', price: 211.81, change: 1.45 },
        { ticker: 'TSLA', price: 172.55, change: -0.85 },
        { ticker: 'AAPL', price: 195.50, change: 0.22 },
        { ticker: 'BTC', price: 68350.0, change: 3.12 },
        { ticker: 'PEPE', price: 0.00000952, change: 12.84 },
        { ticker: 'SPY', price: 542.12, change: 0.45 }
    ];

    function renderTrending() {
        trendingList.innerHTML = '';
        trendingTickers.forEach(t => {
            const changeClass = t.change >= 0 ? 'up' : 'down';
            const changeSign = t.change >= 0 ? '+' : '';
            const priceStr = t.price < 0.01 ? t.price.toFixed(8) : t.price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
            
            const row = document.createElement('div');
            row.className = 'trending-item';
            row.innerHTML = `
                <span class="trending-ticker">${t.ticker}</span>
                <span class="trending-price">$${priceStr}</span>
                <span class="trending-change ${changeClass}">${changeSign}${t.change.toFixed(2)}%</span>
            `;
            trendingList.appendChild(row);
        });
    }

    function updateTrendingPrices() {
        trendingTickers.forEach(t => {
            const pct = (Math.random() - 0.5) * 0.004; // small fluctuation
            t.price += t.price * pct;
            t.change += pct * 100;
        });
        renderTrending();
    }

    // Init loops
    checkPremium();
    checkAuth();
    renderPosts();
    renderTrending();
    renderAISignals();
    
    const aiUpgradeBtn = document.getElementById('ai-upgrade-btn');
    if (aiUpgradeBtn) {
        aiUpgradeBtn.addEventListener('click', () => {
            paymentOverlay.classList.add('active');
        });
    }

    setInterval(updateTrendingPrices, 3000);
    setInterval(checkPremium, 1000);
});
