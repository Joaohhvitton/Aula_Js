
// ============================================================================
// DATASTORE / MODELO DE DADOS DE ACORDO COM OS REQUISITOS DA DOCUMENTAÇÃO
// ============================================================================
let pacientesFila = [
  { senha: "A2001", nome: "Maria Silva", medico: "Dr. Carlos Mendes", espec: "Clínica Geral", sala: "Sala 01 — Clínica Geral", status: "Aguardando", urgente: false },
  { senha: "C2002", nome: "João Oliveira", medico: "Dra. Ana Souza", espec: "Cardiologia", sala: "Sala 02 — Cardiologia", status: "Aguardando", urgente: false },
  { senha: "U2003", nome: "Ana Costa", medico: "Dr. Paulo Oliveira", espec: "Clínica Geral", sala: "Sala 06 — Urgência", status: "Aguardando", urgente: true },
  { senha: "E2004", nome: "Carlos Souza", medico: "Dr. Roberto Lima", espec: "Ortopedia", sala: "Sala 03 — Ortopedia", status: "Aguardando", urgente: false },
  { senha: "P2005", nome: "Fernanda Lima", medico: "Dra. Fernanda Costa", espec: "Pediatria", sala: "Sala 04 — Pediatria", status: "Aguardando", urgente: false }
];

let examesLista = [
  { tipo: "Hemograma Completo", medico: "Dr. Carlos Mendes", data: "Hoje", status: "Disponível" },
  { tipo: "Raio-X de Tórax", medico: "Dr. Roberto Lima", data: "Ontem", status: "Disponível" },
  { tipo: "Eletrocardiograma (ECG)", medico: "Dra. Ana Souza", data: "22/05/2026", status: "Em Análise" }
];

let chamadosRecentes = [];
let indiceChamadaAtual = -1;
let percentualRecuperacao = 45; // Estado inicial do progresso de tratamento

// ============================================================================
// UTILS: RELÓGIO E IDENTIFICADORES BÁSICOS
// ============================================================================
function atualizarRelogio() {
  const agora = new Date();
  document.getElementById('clock').textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('dateDisplay').textContent = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// CONTROLE DO MENU LATERAL RESPONSIVO MÓVEL
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// NAVEGAÇÃO ENTRE AS ABAS DA DOCUMENTAÇÃO
function navigate(viewId, element) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById('view-' + viewId).classList.add('active');
  element.classList.add('active');
  
  // Atualiza o indicador textual do cabeçalho
  document.getElementById('viewIndicator').textContent = element.innerText.replace(/^[^\s]+\s+/, '');
  
  // Fecha a barra lateral no mobile após o clique
  document.getElementById('sidebar').classList.remove('open');
  
  // Gatilho de renderização específica se necessário
  if(viewId === 'tratamento') {
    atualizarCirculoProgresso(percentualRecuperacao);
  }
}

// SISTEMA DE NOTIFICAÇÕES (TOAST)
function emitirToast(titulo, mensagem) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-title">🔔 ${titulo}</div><div class="toast-msg">${mensagem}</div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}

// ============================================================================
// MANIPULAÇÃO DINÂMICA DO DOM COM JAVASCRIPT
// ============================================================================

function renderizarAgendamentos() {
  const tbody = document.getElementById('tabelaAgendamentos');
  tbody.innerHTML = pacientesFila.map(p => {
    let badgeClass = "badge-agendado";
    if(p.status === "Chamando") badgeClass = "badge-proxima";
    if(p.status === "Em atendimento") badgeClass = "badge-confirmado";
    
    return `
      <tr>
        <td style="font-family:'JetBrains Mono', monospace; font-weight:700; color:var(--accent);">${p.senha}</td>
        <td style="font-weight:600;">${p.medico}</td>
        <td>${p.espec}</td>
        <td><span style="color:var(--accent-light); font-weight:500;">${p.sala.split('—')[0].trim()}</span></td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
      </tr>
    `;
  }).join('');
}

function renderizarExames() {
  const tbody = document.getElementById('tabelaExames');
  tbody.innerHTML = examesLista.map(e => `
    <tr>
      <td style="font-weight:600;">${e.tipo}</td>
      <td>${e.medico}</td>
      <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">${e.data}</td>
      <td>
        <span class="status-dot ${e.status === 'Disponível' ? 'dot-serving' : 'dot-waiting'}"></span>
        <span style="font-size:12px; font-weight:500;">${e.status}</span>
      </td>
      <td>
        ${e.status === 'Disponível' ? `<a href="#" class="download-btn" onclick="baixarExame('${e.tipo}')">📥 Baixar PDF</a>` : '—'}
      </td>
    </tr>
  `).join('');
}

function baixarExame(tipo) {
  emitirToast("Download Iniciado", `O arquivo PDF do exame "${tipo}" foi gerado com sucesso.`);
}

function renderizarHistoricoLateral() {
  const container = document.getElementById('recentesFila');
  if(chamadosRecentes.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-dim); font-size:12px; padding:24px;">Nenhum histórico de chamada ativa</div>`;
    return;
  }
  container.innerHTML = chamadosRecentes.map(p => `
    <div class="list-item ${p.urgente ? 'priority' : ''}">
      <div class="item-avatar">${p.urgente ? '🚨' : '👤'}</div>
      <div class="item-main">
        <div class="item-title">${p.nome} <span style="color:var(--accent); font-family:'JetBrains Mono'; margin-left:4px;">${p.senha}</span></div>
        <div class="item-details">${p.sala.split('—')[0].trim()} · ${p.medico}</div>
      </div>
      <span class="badge ${p.status === 'Em atendimento' ? 'badge-confirmado' : 'badge-proxima'}">${p.status}</span>
    </div>
  `).join('');
}

// ============================================================================
// SISTEMA DE SIMULAÇÃO DE CHAMADAS (LÓGICA PRINCIPAL JS)
// ============================================================================
function simularChamada() {
  // Procura o próximo paciente que ainda está como "Aguardando" ou "Chamando"
  let proximoIndice = pacientesFila.findIndex(p => p.status === "Aguardando");
  
  if(proximoIndice === -1) {
    // Se não há mais aguardando, verifica se há alguém "Chamando" para passar a "Em Atendimento"
    let indiceChamando = pacientesFila.findIndex(p => p.status === "Chamando");
    if(indiceChamando !== -1) {
      pacientesFila[indiceChamando].status = "Em atendimento";
      const paciente = pacientesFila[indiceChamando];
      
      // Sincroniza painel principal
      document.getElementById('displayStatusTag').textContent = "Status: Em Atendimento";
      
      emitirToast("Atendimento Iniciado", `${paciente.nome} entrou na ${paciente.sala.split('—')[0].trim()}`);
      atualizarMétricasGlobais();
      renderizarTudo();
      return;
    }
    emitirToast("Fila Concluída", "Todos os pacientes agendados para este turno já foram atendidos.");
    return;
  }

  // Se houver alguém em modo "Chamando", passa ele para atendimento antes de chamar o próximo
  pacientesFila.forEach(p => {
    if(p.status === "Chamando") p.status = "Em atendimento";
  });

  // Atualiza o novo paciente para "Chamando"
  let paciente = pacientesFila[proximoIndice];
  paciente.status = "Chamando";
  
  // Atualiza exibição central do painel
  document.getElementById('displayStatusTag').textContent = "📢 STATUS: CHAMANDO AGORA";
  document.getElementById('displayNumero').textContent = paciente.senha;
  document.getElementById('displayNome').textContent = paciente.nome;
  document.getElementById('displayMedicoSala').textContent = `${paciente.medico} | ${paciente.sala}`;
  
  // Adiciona ao histórico lateral sem duplicar o mesmo paciente na transição de estados
  if(!chamadosRecentes.some(c => c.senha === paciente.senha)) {
    chamadosRecentes.unshift(paciente);
  }
  
  // Animação visual de piscar painel
  const areaDisplay = document.getElementById('chamadaDisplayArea');
  areaDisplay.classList.add('blinking');
  setTimeout(() => areaDisplay.classList.remove('blinking'), 1500);

  // Síntese de Voz (Acessibilidade sonora nativa do JavaScript)
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const mensagemVoz = new SpeechSynthesisUtterance(`Senha ${paciente.senha}. ${paciente.nome}. Comparecer à ${paciente.sala}`);
    mensagemVoz.lang = 'pt-BR';
    mensagemVoz.rate = 0.95;
    speechSynthesis.speak(mensagemVoz);
  }

  emitirToast("Chamada Emitida", `Senha ${paciente.senha} anunciada no painel clínico.`);
  atualizarMétricasGlobais();
  renderizarTudo();
}

function resetarSimulacao() {
  pacientesFila.forEach(p => p.status = "Aguardando");
  chamadosRecentes = [];
  
  document.getElementById('displayStatusTag').textContent = "Status: Aguardando Fila";
  document.getElementById('displayNumero').textContent = "---";
  document.getElementById('displayNome').textContent = "Aguardando Próxima Chamada";
  document.getElementById('displayMedicoSala').textContent = "—";
  
  emitirToast("Fluxo Reiniciado", "A simulação da fila hospitalar foi zerada.");
  atualizarMétricasGlobais();
  renderizarTudo();
}

// ============================================================================
// SIMULAÇÃO DO PROGRESSO DO TRATAMENTO (SVG CIRCULAR)
// ============================================================================
function simularTratamento() {
  if(percentualRecuperacao >= 100) {
    percentualRecuperacao = 100;
    document.getElementById('treatmentMsg').textContent = "Parabéns! Você alcançou a alta médica e completou o ciclo de recuperação estabelecido pela junta hospitalar.";
    emitirToast("Alta Médica Concedida", "Evolução clínica atingiu o patamar máximo de 100%.");
    return;
  }
  percentualRecuperacao += 15;
  if(percentualRecuperacao > 100) percentualRecuperacao = 100;
  
  atualizarCirculoProgresso(percentualRecuperacao);
  atualizarMétricasGlobais();
}

function atualizarCirculoProgresso(pct) {
  document.getElementById('stat-progresso').textContent = pct + "%";
  
  const numText = document.getElementById('circlePercentageNum');
  if (numText) numText.textContent = pct + "%";
  
  // Controle da circunferência do SVG (raio = 70 -> circunferência ≈ 440)
  const bar = document.getElementById('circleFillBar');
  if (bar) {
    const offset = 440 - (440 * pct) / 100;
    bar.style.strokeDashoffset = offset;
  }
}

// METRICAS DINAMICAS DO TOPO
function atualizarMétricasGlobais() {
  document.getElementById('stat-consultas').textContent = pacientesFila.length;
  document.getElementById('stat-exames').textContent = examesLista.filter(e => e.status === "Disponível").length;
  document.getElementById('stat-progresso').textContent = percentualRecuperacao + "%";
}

function renderizarTudo() {
  renderizarAgendamentos();
  renderizarExames();
  renderizarHistoricoLateral();
}

// INICIALIZAÇÃO DO FLUXO COMPLETO DO JS
(function init() {
  atualizarMétricasGlobais();
  renderizarTudo();
  document.getElementById('displayNome').textContent = "Aguardando Chamada Inicial";
})();