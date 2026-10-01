const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

async function fetchPokemonData(urlOrName) {
	const term = String(urlOrName).trim();

	const url = term.startsWith('http')
		? term
		: `${API_URL}/${encodeURIComponent(term.toLowerCase())}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error('Não foi possível buscar o Pokémon.');
	}

	return await response.json();
}

// Função para carregar a lista inicial (ex: primeiros 20)
async function loadInitialPokemon(limit = 20) {
	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const response = await fetch(`${API_URL}?limit=${limit}`);
		const data = await response.json();

		// Faz requisição paralela dos detalhes de cada um dos itens listados
		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);
		const pokemonList = await Promise.all(pokemonPromises);

		// Renderiza cada card
		pokemonList.forEach(renderPokemonCard);
	} catch (error) {
		showError('Erro ao carregar a lista de Pokémon.');
		console.error(error);
	} finally {
		showLoading(false);
	}
}

// Função para criar a estrutura visual do Card no Bootstrap
function renderPokemonCard(pokemon) {
  console.log('Rendering Pokémon:', pokemon); // Log do Pokémon para depuração
	// Pega a imagem oficial de alta qualidade (dream_world ou official-artwork)
	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;

	// Mapeia os tipos para Badges do Bootstrap
	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge bg-secondary badge-type">${t.type.name}</span>`
		)
		.join('');

	// Formata peso (em kg) e altura (em m)
	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
        <div class="col">
<div
	class="card h-100 shadow-sm pokemon-card border-0"
	style="cursor: pointer;"
	role="button"
	tabindex="0"
	onclick="openPokemonModal(${pokemon.id})"
	onkeydown="if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		openPokemonModal(${pokemon.id});
	}"
>            <div class="text-center p-3 bg-white rounded-top">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 160px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
              </div>
              <div class="mb-3">
                ${typesBadges}
              </div>
              <div class="row text-center border-top pt-2">
                <div class="col-6 border-end">
                  <small class="text-muted d-block">Altura</small>
                  <strong>${heightInMeters} m</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Peso</small>
                  <strong>${weightInKg} kg</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

	pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}

// Busca específica por nome ou ID
async function handleSearch() {
	const query = searchInput.value.trim();
	if (!query) {
		loadInitialPokemon();
		return;
	}

	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const pokemon = await fetchPokemonData(query);
		renderPokemonCard(pokemon);
	} catch (error) {
		showError(`Nenhum Pokémon encontrado com o termo "${query}".`);
	} finally {
		showLoading(false);
	}
}

// Utilitários de UI
function showLoading(state) {
	if (state) {
		loading.classList.remove('d-none');
	} else {
		loading.classList.add('d-none');
	}
}

function showError(message) {
	pokemonGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
            ${message}
          </div>
        </div>
      `;
}

// Busca os dados e abre a janela de detalhes.
async function openPokemonModal(id) {
	const modalElement = document.getElementById('pokemonModal');
	const modalTitle = document.getElementById('pokemonModalTitle');
	const modalBody = document.getElementById('pokemonModalBody');

	const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

	modalTitle.textContent = 'Carregando...';
	modalBody.innerHTML = `
		<div class="text-center py-4" role="status">
			<div class="spinner-border text-danger"></div>
			<p class="mt-2 mb-0">Buscando detalhes...</p>
		</div>
	`;

	modal.show();

	try {
		const pokemon = await fetchPokemonData(id);

		modalTitle.textContent =
			`${pokemon.name} #${String(pokemon.id).padStart(3, '0')}`;

		modalBody.innerHTML = renderPokemonDetails(pokemon);
	} catch (error) {
		modalTitle.textContent = 'Erro ao carregar';

		modalBody.innerHTML = `
			<div class="alert alert-danger" role="alert">
				Não foi possível carregar os detalhes.
				Feche esta janela e tente novamente.
			</div>
		`;

		console.error(error);
	}
}

// Monta o conteúdo que será colocado dentro do modal.
function renderPokemonDetails(pokemon) {
	// Nome na API, nome exibido e cor da barra.
	const statsConfig = [
		['hp', 'HP', 'bg-success'],
		['attack', 'Ataque', 'bg-danger'],
		['defense', 'Defesa', 'bg-primary'],
		['speed', 'Velocidade', 'bg-warning']
	];

	const statsHTML = statsConfig
		.map(([name, label, color]) => {
			const value = pokemon.stats
				.find(item => item.stat.name === name)?.base_stat ?? 0;

			const width = Math.min((value / 255) * 100, 100);

			return `
				<div class="mb-3">
					<div class="d-flex justify-content-between">
						<span>${label}</span>
						<strong>${value}</strong>
					</div>

					<div class="progress" style="height: 12px;">
						<div
							class="progress-bar ${color}"
							role="progressbar"
							style="width: ${width}%;"
							aria-label="${label}"
							aria-valuenow="${value}"
							aria-valuemin="0"
							aria-valuemax="255"
						></div>
					</div>
				</div>
			`;
		})
		.join('');

	const abilitiesHTML = pokemon.abilities
		.map(item => `
			<li class="list-group-item text-capitalize">
				${item.ability.name.replaceAll('-', ' ')}
				${item.is_hidden
					? '<small class="text-muted">(oculta)</small>'
					: ''}
			</li>
		`)
		.join('');

	// Prefere o som atual; se ele faltar, tenta o antigo.
	const audioUrl = pokemon.cries?.latest || pokemon.cries?.legacy;

	const audioHTML = audioUrl
		? `
			<audio
				controls
				preload="none"
				src="${audioUrl}"
				class="w-100"
			>
				Seu navegador não suporta áudio.
			</audio>
		`
		: '<p class="text-muted">Som não disponível para este Pokémon.</p>';

	const sprites = [
		['Frente normal', pokemon.sprites.front_default],
		['Costas normal', pokemon.sprites.back_default],
		['Frente shiny', pokemon.sprites.front_shiny],
		['Costas shiny', pokemon.sprites.back_shiny]
	];

	const spritesHTML = sprites
		.map(([label, url]) => `
			<div class="col-6 col-md-3 text-center">
				${url
					? `
						<img
							src="${url}"
							alt="${pokemon.name} — ${label}"
							width="96"
							height="96"
							class="img-fluid"
						>
					`
					: '<p class="text-muted small">Imagem não disponível</p>'}

				<p class="small mb-0">${label}</p>
			</div>
		`)
		.join('');

	return `
		<h3 class="fs-5">Status base</h3>
		<p class="small text-muted">
			Escala visual das barras: 0 a 255.
		</p>
		${statsHTML}

		<h3 class="fs-5 mt-4">Habilidades</h3>
		<ul class="list-group mb-4">
			${abilitiesHTML}
		</ul>

		<h3 class="fs-5">Som do Pokémon</h3>
		${audioHTML}

		<h3 class="fs-5 mt-4">Galeria de sprites</h3>
		<div class="row g-3">
			${spritesHTML}
		</div>
	`;
}

// Eventos

document.getElementById('pokemonModal')
	.addEventListener('hide.bs.modal', () => {
		const audio = document.querySelector('#pokemonModalBody audio');

		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
	});

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') handleSearch();
});

// Inicialização
loadInitialPokemon();