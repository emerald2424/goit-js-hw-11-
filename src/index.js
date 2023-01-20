import './css/common.css'
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import "notiflix/dist/notiflix-3.2.6.min.css";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const searchForm = document.querySelector('#search-form');
const input = document.querySelector('input[name="searchQuery"]')
// const loadMoreBtn = document.querySelector('.load-more');
const galleryList = document.querySelector('.gallery');
const API_KEY = '32852633-0625716e22432e941df8357a0';
const guard = document.querySelector('.js-guard');
let gallery = new SimpleLightbox('.gallery a');
let page = 1;
let query = '';
searchForm.addEventListener('submit', onSearch);
// loadMoreBtn.addEventListener('click', loadMore);


let observerOptions = {
    root: null,
    rootMargin: '300px',
    threshold: 0
}
let observer = new IntersectionObserver(onLoad, observerOptions);

function onSearch(evt) {
    evt.preventDefault();
    galleryList.innerHTML = '';
    // page = 1;
    query = input.value;
    
    fetchImages(query, page = 1)
    .then(data => {
        if (data.data.hits.length === 0) {
            return Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        }
        Notify.success(`Hooray! We found ${data.data.totalHits} images.`);
        renderGallery(data.data.hits);
        
        gallery.refresh();
        observer.observe(guard);

        // if(data.data.totalHits > 40) {
        //     loadMoreBtn.hidden = false;
        // }
        
        // if (!loadMoreBtn.hidden) {
        //     loadMoreBtn.classList.add('load-btn-visible');
        // }
    })
    .catch(err => console.log(err))
}

async function fetchImages(query, page) {
    const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true&q=${query}&page=${page}&per_page=40`)
    console.log(response)
    return response;
}

 
function renderGallery(images) {
    
    const markup = images.map(image => `
    <a href="${image.largeImageURL}">
        <div class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" width="349px" height="200"/>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b><br>${image.likes}
                </p>
                <p class="info-item">
                    <b>Views</b><br>${image.views}
                </p>
                <p class="info-item">
                    <b>Comments</b><br>${image.comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b><br>${image.downloads}
                </p>
            </div>    
        </div>
    </a>`
    ).join('')
    galleryList.insertAdjacentHTML('beforeend', markup);
    
    
}



function loadMore() {
    page += 1;
    
    fetchImages(query, page)
    .then(data => {
        renderGallery(data.data.hits);

        // const { height: cardHeight } = document
        // .querySelector(".gallery")
        // .firstElementChild.getBoundingClientRect();

        // window.scrollBy({
        // top: cardHeight * 2,
        // behavior: "smooth",
        // });
        
        gallery.refresh();
        
        console.log("Page " + page)
        
        const pages = data.data.totalHits / 40;
        if (pages <= page) {
            // loadMoreBtn.hidden = true;
            // loadMoreBtn.classList.remove('load-btn-visible');
            
            observer.unobserve(guard);
            if(data.data.totalHits > 40) {
                Notify.info("We're sorry, but you've reached the end of search results.");
            }
            
        }
    })
    .catch(err => console.log(err))
}

function onLoad(entries, observer) {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            loadMore();
        }
    })
}