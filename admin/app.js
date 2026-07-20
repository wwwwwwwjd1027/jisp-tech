document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('deposits-list');
    const emptyMessage = document.getElementById('empty-message');
    const table = document.getElementById('deposits-table');
    
    // Passcode Gating Logic
    const lockScreen = document.getElementById('lock-screen');
    const adminContainer = document.getElementById('admin-main-container');
    const passcodeInput = document.getElementById('passcode-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMsg = document.getElementById('error-message');

    const ADMIN_PASSWORD = 'jhkh0219!';

    function checkAuth() {
        if (sessionStorage.getItem('jisp_admin_authenticated') === 'true') {
            lockScreen.style.display = 'none';
            adminContainer.style.display = 'block';
            renderList();
        }
    }

    function attemptUnlock() {
        if (passcodeInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('jisp_admin_authenticated', 'true');
            sessionStorage.setItem('jisp_admin_password', passcodeInput.value);
            lockScreen.style.display = 'none';
            adminContainer.style.display = 'block';
            errorMsg.style.display = 'none';
            renderList();
        } else {
            errorMsg.style.display = 'block';
            passcodeInput.value = '';
            passcodeInput.focus();
        }
    }

    unlockBtn.addEventListener('click', attemptUnlock);
    passcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptUnlock();
    });

    // Check existing authentication
    checkAuth();

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-admin-password': sessionStorage.getItem('jisp_admin_password') || ''
        };
    }

    function renderList() {
        fetch('/api/admin/deposits', {
            headers: getHeaders()
        })
        .then(res => {
            if (res.status === 401) {
                // Unauthorized, reset auth
                sessionStorage.removeItem('jisp_admin_authenticated');
                sessionStorage.removeItem('jisp_admin_password');
                location.reload();
                throw new Error('Unauthorized');
            }
            return res.json();
        })
        .then(deposits => {
            listContainer.innerHTML = '';

            if (deposits.length === 0) {
                table.style.display = 'none';
                emptyMessage.style.display = 'block';
                return;
            }

            table.style.display = 'table';
            emptyMessage.style.display = 'none';

            // Render from newest to oldest
            deposits.slice().reverse().forEach((dep, index) => {
                const tr = document.createElement('tr');
                
                const timeStr = new Date(dep.time).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                let statusClass = 'status-pending';
                let statusText = '승인 대기';
                if (dep.status === 'approved') {
                    statusClass = 'status-approved';
                    statusText = '승인 완료';
                } else if (dep.status === 'rejected') {
                    statusClass = 'status-rejected';
                    statusText = '승인 거절';
                } else if (dep.status === 'cancelled') {
                    statusClass = 'status-cancelled';
                    statusText = '멤버십 해지';
                }

                let actionHtml = '';
                if (dep.status === 'pending') {
                    actionHtml = `
                        <button class="btn-approve" data-id="${dep.id}" style="margin-right: 6px;">입금 확인 & 승인</button>
                        <button class="btn-reject" data-id="${dep.id}">거절</button>
                    `;
                } else if (dep.status === 'approved') {
                    actionHtml = `<button class="btn-revoke" data-id="${dep.id}">멤버십 해지 (구독 취소)</button>`;
                } else {
                    actionHtml = `<button class="btn-approve" data-id="${dep.id}">다시 승인하기</button>`;
                }

                let expireText = '';
                if (dep.expiresAt) {
                    const expDate = new Date(dep.expiresAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                    expireText = `<div style="font-size:10px; color:#a7f3d0; margin-top:2px;">~${expDate} 까지 (30일)</div>`;
                }

                tr.innerHTML = `
                    <td style="color: var(--text-muted); font-size:12px;">${timeStr}</td>
                    <td><strong>${dep.name}</strong></td>
                    <td style="font-family: monospace;">${dep.email}</td>
                    <td style="color: #fbbf24; font-weight: 700;">₩3,900</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                        ${expireText}
                    </td>
                    <td>${actionHtml}</td>
                `;
                listContainer.appendChild(tr);
            });

            // Add action listeners
            document.querySelectorAll('.btn-approve').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    approveDeposit(id);
                });
            });

            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    rejectDeposit(id);
                });
            });

            document.querySelectorAll('.btn-revoke').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    revokeDeposit(id);
                });
            });
        })
        .catch(err => console.error('Fetch deposits error:', err));
    }

    function approveDeposit(id) {
        fetch('/api/admin/approve', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(`🎉 입금을 확인하였고, JISP Pro 멤버십을 승인했습니다!`);
                renderList();
            }
        })
        .catch(err => console.error('Approve error:', err));
    }

    function rejectDeposit(id) {
        fetch('/api/admin/reject', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(`❌ 입금 승인 신청을 거절했습니다.`);
                renderList();
            }
        })
        .catch(err => console.error('Reject error:', err));
    }

    function revokeDeposit(id) {
        if (confirm(`Pro 멤버십을 해지하고 구독을 취소하시겠습니까?`)) {
            fetch('/api/admin/revoke', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(`🚫 Pro 구독 해지가 완료되었습니다.`);
                    renderList();
                }
            })
            .catch(err => console.error('Revoke error:', err));
        }
    }

    // Initial render
    if (sessionStorage.getItem('jisp_admin_authenticated') === 'true') {
        renderList();
    }

    // Periodically poll for new requests (admin tab auto-refresh)
    setInterval(() => {
        if (sessionStorage.getItem('jisp_admin_authenticated') === 'true') {
            renderList();
        }
    }, 4000);
});
