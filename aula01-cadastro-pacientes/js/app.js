// Recupera do localStorage se existir, ou inicia um array vazio
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// Controle de ordem (crescente/decrescente)
let ordemCrescente = true;

// Referências aos elementos do DOM
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const totalPacientes = document.getElementById('total-pacientes');
const campoBusca = document.getElementById('campo-busca');
const thNome = document.getElementById('th-nome');

// Salvar pacientes no localStorage
function salvarNoLocalStorage() {
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

// Cálculo automático de idade a partir da data ISO (AAAA-MM-DD)
function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

// Atualizar contador de pacientes
function atualizarContador(quantidade = pacientes.length) {
  totalPacientes.textContent = `Total de pacientes: ${quantidade}`;
}

// Adicionar novo paciente
function adicionarPaciente(nome, email, telefone, nascimento) {
  // Validação de E-mail duplicado
  const emailExiste = pacientes.some(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExiste) {
    alert('Atenção: Já existe um paciente cadastrado com este e-mail!');
    return false;
  }

  const novoPaciente = { nome, email, telefone, nascimento };
  pacientes.push(novoPaciente);
  salvarNoLocalStorage();
  return true;
}

// Remover paciente pelo índice
function removerPaciente(index) {
  if (confirm(`Deseja realmente remover o paciente ${pacientes[index].nome}?`)) {
    pacientes.splice(index, 1);
    salvarNoLocalStorage();
    renderizarTabela();
  }
}

// Renderizar tabela de pacientes
function renderizarTabela(listaParaExibir = pacientes) {
  tabela.innerHTML = '';

  listaParaExibir.forEach((paciente, index) => {
    const linha = document.createElement('tr');

    linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${paciente.telefone}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td>${calcularIdade(paciente.nascimento)} anos</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removerPaciente(${index})">
          Remover
        </button>
      </td>
    `;

    tabela.appendChild(linha);
  });

  atualizarContador(listaParaExibir.length);
}

// Formatar data no padrão dd/mm/aaaa
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Evento do Formulário (Submit)
formulario.addEventListener('submit', (event) => {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const telefone = document.getElementById('telefone').value;
  const nascimento = document.getElementById('nascimento').value;

  const cadastrado = adicionarPaciente(nome, email, telefone, nascimento);

  if (cadastrado) {
    renderizarTabela();
    formulario.reset();
  }
});

// Busca em tempo real (evento input)
campoBusca.addEventListener('input', (event) => {
  const termo = event.target.value.toLowerCase();
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(termo)
  );
  renderizarTabela(pacientesFiltrados);
});

// Ordenação por nome ao clicar no cabeçalho
thNome.addEventListener('click', () => {
  pacientes.sort((a, b) => {
    if (ordemCrescente) {
      return a.nome.localeCompare(b.nome);
    } else {
      return b.nome.localeCompare(a.nome);
    }
  });

  ordemCrescente = !ordemCrescente;
  salvarNoLocalStorage();
  renderizarTabela();
});

// Inicializar a tabela ao carregar a página
renderizarTabela();