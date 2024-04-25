// Import biblioteki SimpleLightbox i Notiflix
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css'; // Import stylów SimpleLightbox

import Notiflix from 'notiflix';

// Zdefiniuj klucz API i podstawowy URL dla Pixabay API
const apiKey = '43574769-6e37a5f1df9cad927843c4fc7';
const baseURL = 'https://pixabay.com/api/';

// Zainicjuj zmienne
let currentPage = 1;
let currentQuery = '';
const perPage = 40; // Liczba obrazków na jedno żądanie

// Zainicjuj SimpleLightbox
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// Pobierz odniesienia do elementów DOM
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

// Dodaj obsługę zdarzenia dla formularza wyszukiwania
searchForm.addEventListener('submit', handleSearch);

// Dodaj obsługę zdarzenia dla przycisku "Load more"
loadMoreButton.addEventListener('click', loadMoreImages);

// Obsługa wyszukiwania z formularza
function handleSearch(event) {
  event.preventDefault();

  const query = searchForm.elements.searchQuery.value.trim();

  if (query === '') {
    Notiflix.Notify.info('Proszę wpisać zapytanie wyszukiwania.');
    return;
  }

  currentQuery = query;
  currentPage = 1;

  // Wyczyść wcześniejsze obrazy z galerii i ukryj przycisk "Load more"
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';

  fetchImages(currentQuery);
}

// Załaduj więcej obrazków po kliknięciu przycisku "Load more"
function loadMoreImages() {
  currentPage++;
  fetchImages(currentQuery);
}

// Pobierz obrazki z API Pixabay
async function fetchImages(query) {
  const url = `${baseURL}?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safe_search=true&page=${currentPage}&per_page=${perPage}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();

      if (currentPage === 1) {
        Notiflix.Notify.success(
          `Hooray! Znaleźliśmy ${data.totalHits} obrazków.`
        );
      }

      displayImages(data);

      // Pokaż przycisk "Load more" jeśli są kolejne obrazki do załadowania
      if (currentPage * perPage < data.totalHits) {
        loadMoreButton.style.display = 'block';
      } else {
        loadMoreButton.style.display = 'none';
        Notiflix.Notify.info(
          'Przepraszamy, ale doszliście do końca wyników wyszukiwania.'
        );
      }
    } else {
      Notiflix.Notify.failure(
        'Coś poszło nie tak. Proszę spróbować ponownie później.'
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Nie udało się pobrać obrazków. Proszę sprawdzić połączenie.'
    );
  }
}

// Wyświetl obrazki w galerii
function displayImages(data) {
  data.hits.forEach(hit => {
    // Utwórz element karty zdjęcia
    const card = document.createElement('div');
    card.classList.add('photo-card');

    // Utwórz element linku dla SimpleLightbox
    const link = document.createElement('a');
    link.href = hit.largeImageURL;
    link.setAttribute('data-lightbox', 'image-gallery');

    // Utwórz element obrazu
    const img = document.createElement('img');
    img.src = hit.webformatURL;
    img.alt = hit.tags;
    img.loading = 'lazy';

    // Dodaj obraz do linku
    link.appendChild(img);

    // Dodaj link do karty
    card.appendChild(link);

    // Utwórz sekcję informacji
    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = `
            <p class="info-item"><b>Likes</b>: ${hit.likes}</p>
            <p class="info-item"><b>Views</b>: ${hit.views}</p>
            <p class="info-item"><b>Comments</b>: ${hit.comments}</p>
            <p class="info-item"><b>Downloads</b>: ${hit.downloads}</p>
        `;

    // Dodaj sekcję informacji do karty
    card.appendChild(info);

    // Dodaj kartę do galerii
    gallery.appendChild(card);
  });

  // Odśwież SimpleLightbox
  lightbox.refresh();

  // Płynne przewijanie do nowych obrazów
  scrollToNewImages();
}

// Płynne przewijanie do nowych obrazków
function scrollToNewImages() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// Inicjuj nieskończone przewijanie
function initInfiniteScroll() {
  window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const galleryHeight = document.querySelector('.gallery').offsetHeight;

    // Załaduj więcej obrazków, jeśli użytkownik zbliża się do końca galerii
    if (scrollPosition >= galleryHeight - 100) {
      loadMoreImages();
    }
  });
}

// Inicjuj nieskończone przewijanie
initInfiniteScroll();
