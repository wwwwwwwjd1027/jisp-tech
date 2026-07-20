// Scripts for JISP Technology Portal
document.addEventListener('DOMContentLoaded', () => {
    // API Server Configuration - CHANGE THIS to your Render URL after deployment (e.g. 'https://jisp-backend.onrender.com')
    const API_BASE = 'http://localhost:8000';

    console.log("JISP Technology Portal Initialized.");

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

    let authMode = 'login'; // 'login' or 'register'

    // Sync Premium Status
    function checkPremium() {
        if (!premiumBtn) return;
        if (localStorage.getItem('jisp_premium') === null) {
            localStorage.setItem('jisp_premium', 'false');
        }
        const isPremium = localStorage.getItem('jisp_premium') === 'true';
        if (isPremium) {
            premiumBtn.textContent = 'JISP Pro 회원';
            premiumBtn.classList.add('premium-active');
        } else {
            premiumBtn.textContent = 'JISP Pro 가입';
            premiumBtn.classList.remove('premium-active');
        }
    }

    // Sync User Auth Status
    function checkAuth() {
        const userRaw = localStorage.getItem('jisp_user');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                // Logged In state: show profile block in place of button
                authBtn.outerHTML = `<div id="portal-auth-profile" class="profile-card-nav">
                    <span>👤 ${user.username}</span>
                    <button class="logout-btn-nav" id="portal-logout-btn">로그아웃</button>
                </div>`;
                
                // Re-bind logout button
                document.getElementById('portal-logout-btn').addEventListener('click', () => {
                    localStorage.removeItem('jisp_user');
                    alert('로그아웃 되었습니다.');
                    location.reload(); // reload to draw authBtn again
                });
            } catch (e) {
                localStorage.removeItem('jisp_user');
            }
        }
    }

    // Premium click handler
    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => {
            const isPremium = localStorage.getItem('jisp_premium') === 'true';
            if (isPremium) {
                if (confirm('JISP Pro 구독을 취소하시겠습니까? (취소 시 다음 달 결제가 연장되지 않으며 즉시 등급 해제됩니다)')) {
                    const userRaw = localStorage.getItem('jisp_user');
                    let username = 'User';
                    let email = '';
                    if (userRaw) {
                        try {
                            const u = JSON.parse(userRaw);
                            username = u.username || 'User';
                            email = u.email || '';
                        } catch(e) {}
                    }
                    
                    // Trigger cancellation webhook
                    sendDiscordCancelWebhook(username, email);

                    localStorage.setItem('jisp_premium', 'false');
                    if (userRaw) {
                        try {
                            const u = JSON.parse(userRaw);
                            localStorage.setItem('jisp_user_premium_' + u.username, 'false');
                        } catch(e) {}
                    }
                    
                    checkPremium();
                    alert('구독이 성공적으로 해지되었습니다. (지후 대표님 디스코드로 구독 취소 알림 발송 완료)');
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

    function startTossPaymentsPayment(modalBody, modalFooter) {
        const originalBodyHtml = modalBody.innerHTML;
        const originalFooterDisplay = modalFooter.style.display;
        modalFooter.style.display = 'none';

        modalBody.innerHTML = `
<div class="toss-flow-container" style="color: #fff; text-align: left; padding: 5px; font-family: sans-serif;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
    <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; color: #3b82f6;">
      <span style="color: #3b82f6; font-size: 16px;">🔵</span> 토스페이먼츠 간편결제
    </div>
    <span style="font-size: 10px; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">테스트 결제 (Sandbox)</span>
  </div>
  
  <div id="toss-step-1">
    <div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 12px;">결제하실 카드를 선택해 주세요.</div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
      <button class="toss-card-select" data-card="토스뱅크" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">🔵 토스뱅크</button>
      <button class="toss-card-select" data-card="신한카드" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">🔴 신한카드</button>
      <button class="toss-card-select" data-card="국민카드" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">🟡 KB국민</button>
      <button class="toss-card-select" data-card="현대카드" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">⚪ 현대카드</button>
      <button class="toss-card-select" data-card="삼성카드" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">🔵 삼성카드</button>
      <button class="toss-card-select" data-card="우리카드" style="background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">🟢 우리카드</button>
    </div>
  </div>

  <div id="toss-step-2" style="display: none; flex-direction: column; gap: 14px;">
    <div>
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-weight: 600;">선택된 카드</div>
      <div id="toss-selected-card-display" style="font-weight: 700; font-size: 13.5px; color: #fff;">카드사</div>
    </div>
    <div>
      <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 6px; font-weight: 600;">카드 번호 입력</label>
      <input type="text" id="toss-card-num" placeholder="1234 - 5678 - 9012 - 3456" maxlength="25" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0d1117; color: #fff; outline: none; font-size: 12.5px; box-sizing: border-box;">
    </div>
    <div style="display: flex; gap: 10px;">
      <div style="flex: 1;">
        <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 6px; font-weight: 600;">유효 기간</label>
        <input type="text" id="toss-card-expiry" placeholder="MM / YY" maxlength="7" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0d1117; color: #fff; outline: none; font-size: 12.5px; text-align: center; box-sizing: border-box;">
      </div>
      <div style="flex: 1;">
        <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 6px; font-weight: 600;">비밀번호 앞 2자리</label>
        <input type="password" id="toss-card-pwd" placeholder="••" maxlength="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0d1117; color: #fff; outline: none; font-size: 12.5px; text-align: center; box-sizing: border-box;">
      </div>
    </div>
    <button id="toss-pay-submit-btn-local" style="width:100%; background: #3b82f6; border: none; color: #fff; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; text-align: center; margin-top: 10px;">카드 등록 및 정기 구독 승인</button>
  </div>

  <div id="toss-step-3" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 30px 0; text-align: center; gap: 16px;">
    <div class="toss-spinner" style="border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; animation: toss-spin 1s linear infinite; margin: 0 auto;"></div>
    <div>
      <div style="font-weight: 700; font-size: 13.5px; color: #fff; margin-bottom: 6px;">토스페이먼츠 보안 결제 처리 중...</div>
      <div style="font-size: 10.5px; color: #94a3b8;">정산 수령자: JISP 대표 정지후 (토스뱅크 1908-1176-4795)</div>
    </div>
  </div>
</div>
<style>
@keyframes toss-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
        `;

        const cardBtns = modalBody.querySelectorAll('.toss-card-select');
        const step1 = modalBody.querySelector('#toss-step-1');
        const step2 = modalBody.querySelector('#toss-step-2');
        const step3 = modalBody.querySelector('#toss-step-3');
        const cardDisplay = modalBody.querySelector('#toss-selected-card-display');

        cardBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cardName = btn.dataset.card;
                cardDisplay.textContent = cardName;
                step1.style.display = 'none';
                step2.style.display = 'flex';
            });
        });

        const cardNumInput = modalBody.querySelector('#toss-card-num');
        cardNumInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' - ';
                formatted += val[i];
            }
            e.target.value = formatted;
        });

        const expiryInput = modalBody.querySelector('#toss-card-expiry');
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i === 2) formatted += ' / ';
                formatted += val[i];
            }
            e.target.value = formatted;
        });

        const submitBtnLocal = modalBody.querySelector('#toss-pay-submit-btn-local');
        submitBtnLocal.addEventListener('click', () => {
            const num = cardNumInput.value.trim();
            const exp = expiryInput.value.trim();
            const pwd = modalBody.querySelector('#toss-card-pwd').value.trim();

            if (num.length < 25 || exp.length < 7 || pwd.length < 2) {
                alert('카드 정보를 올바르게 입력해 주세요.');
                return;
            }

            step2.style.display = 'none';
            step3.style.display = 'flex';

            localStorage.setItem('jisp_pay_origin', window.location.href);

            setTimeout(() => {
                window.location.replace('../payment/success.html');
            }, 2000);
        });

        const closeBtn = document.getElementById('jisp-payment-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalBody.innerHTML = originalBodyHtml;
                modalFooter.style.display = originalFooterDisplay;
            });
        }
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

    function sendDiscordCancelWebhook(name, email) {
        const webhookUrl = localStorage.getItem('jisp_discord_webhook');
        if (!webhookUrl) return;

        const payload = {
            username: "JISP 결제 알리미",
            embeds: [{
                title: "🚫 JISP Pro 구독 해지 알림",
                color: 16729390, // Red
                fields: [
                    { name: "👤 사용자명", value: name, inline: true },
                    { name: "📧 이메일", value: email || "없음", inline: true },
                    { name: "📅 해지 시간", value: new Date().toLocaleString("ko-KR"), inline: false }
                ],
                footer: { text: "JISP Payment System" }
            }]
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Discord Cancel Webhook Error:', err));
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

            fetch(API_BASE + '/api/payment/request', {
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
                alert('서버 통신에 실패했습니다. 백엔드가 실행 중인지 확인하세요.');
                submitBtn.disabled = false;
                submitBtn.textContent = '송금 완료 확인 신청';
            });
        });
    }

    // Auth Events
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

    // Toggle between Login & Register mode
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
        // Re-bind click event to new switch link
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

        if (authMode === 'register') {
            const username = authUsernameInput.value.trim() || 'User';
            fetch(API_BASE + '/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password: pw })
            })
            .then(res => res.json())
            .then(data => {
                authSubmit.disabled = false;
                authSubmit.textContent = '가입하기';
                if (data.error) {
                    alert(data.error);
                } else {
                    const user = { username: data.user.username, email: data.user.email, loggedIn: true };
                    localStorage.setItem('jisp_user', JSON.stringify(user));
                    
                    // Backward compatibility support for local files
                    let registeredUsers = [];
                    try {
                        const raw = localStorage.getItem('jisp_registered_users');
                        if (raw) registeredUsers = JSON.parse(raw);
                    } catch (e) {}
                    registeredUsers.push({ username, email, password: pw });
                    localStorage.setItem('jisp_registered_users', JSON.stringify(registeredUsers));

                    alert(`🎉 회원가입 완료! ${username}님 가입을 축하합니다.`);
                    authOverlay.classList.remove('active');
                    location.reload();
                }
            })
            .catch(err => {
                console.error(err);
                alert('서버 통신 실패. 회원가입이 불가능합니다.');
                authSubmit.disabled = false;
                authSubmit.textContent = '가입하기';
            });
        } else {
            fetch(API_BASE + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pw })
            })
            .then(res => res.json())
            .then(data => {
                authSubmit.disabled = false;
                authSubmit.textContent = '로그인';
                if (data.error) {
                    alert(data.error);
                } else {
                    const user = { username: data.user.username, email: data.user.email, loggedIn: true };
                    localStorage.setItem('jisp_user', JSON.stringify(user));
                    
                    // Sync premium state from server DB
                    localStorage.setItem('jisp_premium', data.user.premium ? 'true' : 'false');
                    localStorage.setItem('jisp_user_premium_' + data.user.username, data.user.premium ? 'true' : 'false');

                    alert(`👋 환영합니다! ${data.user.username}님 로그인에 성공했습니다.`);
                    authOverlay.classList.remove('active');
                    location.reload();
                }
            })
            .catch(err => {
                console.error(err);
                alert('서버 통신 실패. 로그인이 불가능합니다.');
                authSubmit.disabled = false;
                authSubmit.textContent = '로그인';
            });
        }
    });

    // Check periodically for sync across tabs
    setInterval(checkPremium, 1000);
    checkPremium();
    checkAuth();
});
