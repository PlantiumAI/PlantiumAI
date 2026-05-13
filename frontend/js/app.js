/**
 * PlantiuIA — App Principal
 * Controla navegação, estado e interações do dashboard.
 */

let currentPage = 'dashboard';
let selectedFile = null;
let plantsCache = [];

// ===== NAVIGATION =====
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const section = document.getElementById(`page-${page}`);
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    const titles = {
        dashboard: 'Dashboard', analysis: 'Análise de Saúde', irrigation: 'Irrigação',
        plants: 'Minhas Plantas', consult: 'Consultar IA', settings: 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[page] || page;
    currentPage = page;

    if (page === 'dashboard') loadDashboard();
    if (page === 'plants') loadPlants();
    if (page === 'settings') loadSettings();
    if (page === 'analysis' || page === 'irrigation') refreshPlantSelects();
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function openAddPlantModal() { openModal('modal-add-plant'); }

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const data = await api.getDashboard();
        document.getElementById('stat-plants').textContent = data.total_plants;
        document.getElementById('stat-analyses').textContent = data.total_analyses;
        document.getElementById('stat-irrigations').textContent = data.total_irrigations;
        document.getElementById('stat-alerts').textContent = data.unread_alerts;

        const sub = data.healthy_plants > 0
            ? `${data.healthy_plants} saudáveis, ${data.plants_needing_attention} atenção`
            : 'Nenhuma planta cadastrada';
        document.getElementById('stat-plants-sub').textContent = sub;

        // Recent analyses
        const ra = document.getElementById('recent-analyses');
        if (data.recent_analyses && data.recent_analyses.length > 0) {
            ra.innerHTML = data.recent_analyses.map(a => `
                <div class="alert-item">
                    <div class="alert-dot ${a.health === 'critical' ? 'critical' : a.health === 'poor' ? 'warning' : 'info'}"></div>
                    <div>
                        <div class="alert-title">${a.type === 'leaf' ? '🍃 Folha' : '🌱 Planta'} — Planta #${a.plant_id}</div>
                        <div class="alert-message"><span class="health-badge ${a.health}">${a.health}</span> (${a.confidence}%) via ${a.provider}</div>
                        <div class="alert-time">${new Date(a.created_at).toLocaleString('pt-BR')}</div>
                    </div>
                </div>
            `).join('');
        }

        // AI Status
        renderAIStatus(data.ai_status);
    } catch (e) {
        showToast('Erro ao carregar dashboard: ' + e.message, 'error');
    }
}

function renderAIStatus(status) {
    if (!status) return;
    const el = document.getElementById('ai-status-detail');
    const providers = status.providers || {};
    const metrics = status.metrics || {};

    let html = `<div class="diagnosis-item"><div class="diagnosis-label">Modo</div><div class="diagnosis-value">${status.mode}</div></div>`;
    html += `<div class="diagnosis-item"><div class="diagnosis-label">Requisições</div><div class="diagnosis-value">${metrics.total_requests || 0} total — ${metrics.success_rate || 0}% sucesso</div></div>`;

    for (const [name, info] of Object.entries(providers)) {
        const cb = info.circuit_breaker || {};
        const stateEmoji = cb.state === 'closed' ? '🟢' : cb.state === 'open' ? '🔴' : '🟡';
        html += `<div class="diagnosis-item">
            <div class="diagnosis-label">${stateEmoji} ${name}</div>
            <div class="diagnosis-value">${info.type} — ${cb.state || 'unknown'} (${cb.failure_count || 0} falhas)</div>
        </div>`;
    }
    el.innerHTML = html;

    // Sidebar badge
    const dot = document.getElementById('ai-status-dot');
    const txt = document.getElementById('ai-status-text');
    const hasAvail = Object.values(providers).some(p => p.circuit_breaker?.is_available);
    dot.className = `ai-status-dot ${hasAvail ? '' : 'offline'}`;
    txt.textContent = `IA: ${status.mode}`;
}

// ===== PLANTS =====
async function loadPlants() {
    try {
        const plants = await api.getPlants();
        plantsCache = plants;
        const el = document.getElementById('plants-list');
        if (plants.length === 0) {
            el.innerHTML = `<div class="empty-state"><div class="empty-icon">🌱</div><div class="empty-text">Nenhuma planta cadastrada</div><button class="btn btn-primary" onclick="openAddPlantModal()">Cadastrar Primeira Planta</button></div>`;
            return;
        }
        el.innerHTML = `<table class="data-table"><thead><tr><th>Nome</th><th>Espécie</th><th>Estágio</th><th>Local</th><th>Ações</th></tr></thead><tbody>${plants.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.species || '—'}</td>
                <td>${p.stage}</td>
                <td>${p.location || '—'}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deletePlant(${p.id})">Remover</button></td>
            </tr>`).join('')}</tbody></table>`;
    } catch (e) { showToast('Erro ao carregar plantas: ' + e.message, 'error'); }
}

async function createPlant() {
    const name = document.getElementById('plant-name').value.trim();
    if (!name) { showToast('Nome é obrigatório', 'error'); return; }
    try {
        await api.createPlant({
            name,
            species: document.getElementById('plant-species').value,
            stage: document.getElementById('plant-stage').value,
            location: document.getElementById('plant-location').value,
        });
        showToast(`Planta "${name}" cadastrada!`, 'success');
        closeModal('modal-add-plant');
        document.getElementById('plant-name').value = '';
        document.getElementById('plant-species').value = '';
        document.getElementById('plant-location').value = '';
        loadPlants();
        refreshPlantSelects();
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function deletePlant(id) {
    if (!confirm('Remover esta planta e todos os dados associados?')) return;
    try {
        await api.deletePlant(id);
        showToast('Planta removida', 'success');
        loadPlants();
        refreshPlantSelects();
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function refreshPlantSelects() {
    try {
        const plants = plantsCache.length ? plantsCache : await api.getPlants();
        plantsCache = plants;
        const opts = '<option value="">Selecione uma planta...</option>' + plants.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        const selects = ['analysis-plant-select', 'irrigation-plant-select'];
        selects.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = opts; });
    } catch (e) { /* silent */ }
}

// ===== ANALYSIS =====
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('upload-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.querySelector('.upload-icon').style.display = 'none';
        document.querySelector('.upload-text').textContent = file.name;
        document.querySelector('.upload-hint').textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    };
    reader.readAsDataURL(file);
    document.getElementById('btn-analyze').disabled = false;
}

// Drag & Drop
document.addEventListener('DOMContentLoaded', () => {
    const zone = document.getElementById('upload-zone');
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const input = document.getElementById('file-input');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileSelect({ target: input });
        }
    });
});

async function submitAnalysis() {
    const plantId = document.getElementById('analysis-plant-select').value;
    if (!plantId) { showToast('Selecione uma planta', 'error'); return; }
    if (!selectedFile) { showToast('Selecione uma imagem', 'error'); return; }

    const btn = document.getElementById('btn-analyze');
    btn.disabled = true;
    btn.textContent = '⏳ Analisando...';

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('plant_id', plantId);
    formData.append('analysis_type', document.getElementById('analysis-type-select').value);
    formData.append('extra_info', document.getElementById('analysis-extra').value);

    try {
        const result = await api.analyzeImage(formData);
        renderAnalysisResult(result);
        showToast('Análise concluída!', 'success');
    } catch (e) {
        showToast('Erro na análise: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔬 Analisar com IA';
    }
}

function renderAnalysisResult(r) {
    const el = document.getElementById('analysis-result');
    const d = r.diagnosis || {};
    const recs = r.recommendations || [];
    const obs = r.observations || [];

    el.innerHTML = `
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
            <span class="health-badge ${r.health_status}" style="font-size:0.85rem;padding:6px 16px">${r.health_status.toUpperCase()}</span>
            <span style="color:var(--text-secondary);font-size:0.85rem">${r.confidence}% confiança — via ${r.ai_provider} (${r.latency_ms.toFixed(0)}ms)</span>
        </div>
        <div class="diagnosis-item">
            <div class="diagnosis-label">Diagnóstico Principal</div>
            <div class="diagnosis-value">${d.primary_issue || '—'}</div>
        </div>
        <div class="diagnosis-item">
            <div class="diagnosis-label">Categoria / Severidade</div>
            <div class="diagnosis-value">${d.category || '—'} / ${d.severity || '—'}</div>
        </div>
        ${d.details ? `<div class="diagnosis-item"><div class="diagnosis-label">Detalhes</div><div class="diagnosis-value">${d.details}</div></div>` : ''}
        ${obs.length > 0 ? `<div class="diagnosis-item"><div class="diagnosis-label">Observações</div><div class="diagnosis-value">${obs.map(o => `• ${o}`).join('<br>')}</div></div>` : ''}
        ${recs.length > 0 ? `<div class="diagnosis-item"><div class="diagnosis-label">Recomendações</div><div class="diagnosis-value">${recs.map(r => `• <strong>[${r.priority}]</strong> ${r.action}: ${r.details || ''}`).join('<br>')}</div></div>` : ''}
    `;
}

// ===== IRRIGATION =====
const irrigationPlantSelect = document.getElementById('irrigation-plant-select');
if (irrigationPlantSelect) {
    irrigationPlantSelect.addEventListener('change', async function () {
        const id = this.value;
        if (!id) return;
        try {
            const reading = await api.getLatestSensor(id);
            renderSensorData(reading);
        } catch { renderSensorData(null); }
    });
}

function renderSensorData(r) {
    const el = document.getElementById('irrigation-sensors');
    if (!r) { el.innerHTML = '<div class="empty-state"><div class="empty-text" style="font-size:0.85rem">Nenhum dado de sensor. Clique em "Simular Sensores".</div></div>'; return; }

    const moistureColor = r.soil_moisture < 30 ? 'var(--status-critical)' : r.soil_moisture < 50 ? 'var(--status-moderate)' : 'var(--status-excellent)';
    el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md)">
            <div class="gauge-container" style="--percent:${r.soil_moisture || 0}">
                <div class="gauge-ring" style="background:conic-gradient(${moistureColor} ${(r.soil_moisture || 0) * 3.6}deg, var(--border) 0)">
                    <span class="gauge-value">${(r.soil_moisture || 0).toFixed(0)}%</span>
                </div>
                <div class="gauge-label">Umidade Solo</div>
            </div>
            <div class="gauge-container">
                <div style="font-size:2rem;font-weight:700;color:var(--orange)">${(r.air_temperature || 0).toFixed(1)}°</div>
                <div class="gauge-label">Temperatura</div>
            </div>
            <div class="gauge-container">
                <div style="font-size:2rem;font-weight:700;color:var(--blue)">${(r.air_humidity || 0).toFixed(0)}%</div>
                <div class="gauge-label">Umidade Ar</div>
            </div>
        </div>`;
}

async function askAIIrrigation() {
    const plantId = document.getElementById('irrigation-plant-select').value;
    if (!plantId) { showToast('Selecione uma planta', 'error'); return; }

    const el = document.getElementById('irrigation-decision');
    el.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const decision = await api.decideIrrigation(plantId);
        const urgColor = { none: 'var(--text-dim)', low: 'var(--status-good)', medium: 'var(--status-moderate)', high: 'var(--status-poor)', critical: 'var(--status-critical)' };
        el.innerHTML = `
            <div class="diagnosis-item">
                <div class="diagnosis-label">Decisão</div>
                <div class="diagnosis-value" style="font-size:1.2rem;color:${decision.should_irrigate ? 'var(--status-excellent)' : 'var(--text-secondary)'}">
                    ${decision.should_irrigate ? '✅ IRRIGAR — ' + decision.duration_minutes + ' minutos' : '⏸️ NÃO IRRIGAR AGORA'}
                </div>
            </div>
            <div class="diagnosis-item">
                <div class="diagnosis-label">Confiança / Urgência</div>
                <div class="diagnosis-value">${decision.confidence}% — <span style="color:${urgColor[decision.urgency] || 'inherit'}">${decision.urgency}</span></div>
            </div>
            <div class="diagnosis-item">
                <div class="diagnosis-label">Raciocínio</div>
                <div class="diagnosis-value">${decision.reasoning}</div>
            </div>
            ${decision.warnings?.length ? `<div class="diagnosis-item"><div class="diagnosis-label">⚠️ Avisos</div><div class="diagnosis-value">${decision.warnings.join('<br>')}</div></div>` : ''}
            <div style="margin-top:var(--space-md);font-size:0.8rem;color:var(--text-dim)">Próxima verificação em ${decision.next_check_minutes} min</div>
        `;
        if (decision.should_irrigate) showToast(`IA recomenda irrigar por ${decision.duration_minutes} min`, 'info');
    } catch (e) { el.innerHTML = `<div class="empty-state"><div class="empty-text" style="color:var(--status-critical)">${e.message}</div></div>`; }
}

async function triggerManualIrrigation() {
    const plantId = document.getElementById('irrigation-plant-select').value;
    if (!plantId) { showToast('Selecione uma planta', 'error'); return; }
    try {
        await api.triggerIrrigation({ plant_id: parseInt(plantId), duration_minutes: 15, triggered_by: 'manual' });
        showToast('💧 Irrigação manual ativada (15 min)', 'success');
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ===== SENSORS =====
async function simulateSensors() {
    if (plantsCache.length === 0) {
        try { plantsCache = await api.getPlants(); } catch { showToast('Cadastre uma planta primeiro', 'error'); return; }
    }
    if (plantsCache.length === 0) { showToast('Cadastre uma planta primeiro', 'error'); return; }
    try {
        for (const p of plantsCache) await api.simulateSensor(p.id);
        showToast(`📡 Sensores simulados para ${plantsCache.length} planta(s)`, 'success');
        if (currentPage === 'dashboard') loadDashboard();
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ===== SETTINGS =====
async function loadSettings() {
    try {
        const status = await api.getAIStatus();
        document.getElementById('settings-ai-mode').value = status.mode;
        renderProvidersStatus(status.providers);
    } catch (e) { showToast('Erro ao carregar configurações', 'error'); }
}

function renderProvidersStatus(providers) {
    const el = document.getElementById('providers-status');
    let html = '';
    for (const [name, info] of Object.entries(providers)) {
        const cb = info.circuit_breaker || {};
        const stateColor = cb.state === 'closed' ? 'var(--status-excellent)' : cb.state === 'open' ? 'var(--status-critical)' : 'var(--status-moderate)';
        html += `<div class="diagnosis-item">
            <div class="diagnosis-label" style="display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:${stateColor};display:inline-block"></span>
                ${name} (${info.type})
            </div>
            <div class="diagnosis-value" style="font-size:0.85rem">
                Circuit: ${cb.state} | Falhas: ${cb.failure_count}/${cb.failure_threshold} | Disponível: ${cb.is_available ? '✅' : '❌'}
            </div>
        </div>`;
    }
    el.innerHTML = html || '<div class="empty-state"><div class="empty-text">Nenhum provedor configurado</div></div>';
}

async function changeAIMode(mode) {
    try {
        await api.setAIMode(mode);
        showToast(`Modo alterado: ${mode}`, 'success');
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function resetCircuitBreakers() {
    try {
        await api.resetCB();
        showToast('Circuit breakers resetados', 'success');
        loadSettings();
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ===== CONSULTATION =====
async function submitConsultation() {
    const question = document.getElementById('consult-question').value.trim();
    if (!question || question.length < 5) { showToast('Escreva uma pergunta', 'error'); return; }

    const el = document.getElementById('consult-result');
    el.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const result = await api.consult({ question });
        el.innerHTML = `
            <div class="card" style="margin-top:var(--space-md)">
                <div class="card-header"><h3 class="card-title">💬 Resposta</h3></div>
                <div style="white-space:pre-wrap;line-height:1.7;font-size:0.92rem">${result.answer}</div>
                <div style="margin-top:var(--space-md);font-size:0.75rem;color:var(--text-dim)">
                    via ${result.provider} (${result.model}) — ${result.latency_ms.toFixed(0)}ms
                </div>
            </div>`;
    } catch (e) {
        el.innerHTML = `<div class="diagnosis-item" style="color:var(--status-critical)">Erro: ${e.message}</div>`;
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    refreshPlantSelects();
});
