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
const guard2 = document.querySelector('.js-guard_2');
let gallery = new SimpleLightbox('.gallery a');
let page = 1;
let pages;
let query = '';
searchForm.addEventListener('submit', onSearch);
// loadMoreBtn.addEventListener('click', loadMore);


let observerOptions = {
    root: null,
    rootMargin: '300px',
    threshold: 0
}
let observer = new IntersectionObserver(onLoad, observerOptions);
let observer2 = new IntersectionObserver(onCompleteLoad, observerOptions);


async function onSearch(evt) {
    evt.preventDefault();
    // loadMoreBtn.hidden = true;
    // loadMoreBtn.classList.remove('load-btn-visible');
    galleryList.innerHTML = '';
    page = 1;
    observer.unobserve(guard);
    observer2.unobserve(guard2);
       
    query = input.value.trim();
    if (query === '') {
        return Notify.info("Please, enter the category you are interested in!")
    }

    try {
        const data = await fetchImages(query, page)
            
        if (data.hits.length === 0) {
            return Notify.failure("Sorry, there are no images matching your search query. Please, try again.");
        }
                
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        renderGallery(data.hits);
        gallery.refresh();
        
        observer.observe(guard);

        // if(data.totalHits > 40) {
        //     loadMoreBtn.hidden = false;
        // }
                
        // if (!loadMoreBtn.hidden) {
        //     loadMoreBtn.classList.add('load-btn-visible');
        // }
    } catch (error) {
        console.log(error)
    }
}

async function fetchImages(query, page) {
    const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true&q=${query}&page=${page}&per_page=40`)
    console.log("page"+page, response);
    return await response.data;
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



async function loadMore() {
    try {
        page += 1;
        const data = await fetchImages(query, page);
        renderGallery(data.hits);

        // const { height: cardHeight } = document
        // .querySelector(".gallery")
        // .firstElementChild.getBoundingClientRect();

        // window.scrollBy({
        // top: cardHeight * 2,
        // behavior: "smooth",
        // });
        
        gallery.refresh();
        pages = Math.ceil(data.totalHits / 40);
        if (pages === page) {
            observer2.observe(guard2);
            observer.unobserve(guard);
        }
    } catch(error) {
        console.log(error)
    }
}

function onLoad(entries, observer) {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            loadMore();
        }    
    })
}

function onCompleteLoad(entries, observer) {
    entries.forEach(entry => {
        if(entry.isIntersecting && pages === page) {
            Notify.info("We're sorry, but you've reached the end of search results.");
        }    
    })
}