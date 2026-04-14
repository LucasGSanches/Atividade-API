const BASE_URL = "http://www.omdbapi.com/";
let img;
let totalSeasons;

// função pra fazer requisição
async function fetchJSON(url) {
    const response = await fetch(url);
    return response.json();
}

// pega número total de temporadas
async function getTotalSeasons(seriesName) {
    const data = await fetchJSON(`${BASE_URL}?t=${seriesName}&apikey=${API_KEY}`);
    img = data.Poster;
    return parseInt(data.totalSeasons);
}

// pega episódios de uma temporada
async function getSeasonEpisodes(seriesName, season) {
    const data = await fetchJSON(`${BASE_URL}?t=${seriesName}&Season=${season}&apikey=${API_KEY}`);
    return data.Episodes || [];
}

// pega detalhes de um episódio (inclui rating)
async function getEpisodeDetails(imdbID) {
    const data = await fetchJSON(`${BASE_URL}?i=${imdbID}&apikey=${API_KEY}`);
    return {
        title: data.Title,
        season: data.Season,
        episode: data.Episode,
        rating: data.imdbRating
    };
}

// função principal
async function getAllEpisodeRatings(seriesName) {
    totalSeasons = await getTotalSeasons(seriesName);
    const result = [];

    for (let s = 1; s <= totalSeasons; s++) {
        console.log(`Buscando temporada ${s}...`);

        const episodes = await getSeasonEpisodes(seriesName, s);

        for (const ep of episodes) {
            const details = await getEpisodeDetails(ep.imdbID);

            result.push(details);

            console.log(`✔ ${details.title} - Nota: ${details.rating}`);
        }
    }

    return result;
}


(async () => {
    const SeriesName = "Breaking Bad";
    const cacheKey = `ratings_${SeriesName}`;
    let ratings;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        console.log("Dados do cache");
        const data = JSON.parse(cached);
        ratings = data.ratings;
        img = data.img;
        totalSeasons = data.totalSeasons;
    } else {
        console.log("Buscando da API...");
        ratings = await getAllEpisodeRatings(SeriesName);
        localStorage.setItem(cacheKey, JSON.stringify({ ratings, img, totalSeasons }));
    }
    const header = document.querySelector("header");
    let new_h1 = document.createElement("h1");
    let text_node = document.createTextNode(SeriesName);
    new_h1.appendChild(text_node);
    header.appendChild(new_h1);
    let new_img = document.createElement("img");
    new_img.src = img;
    header.appendChild(new_img);
    let new_main_container = document.createElement("div");
    const section = document.querySelector("section");
    new_main_container.classList.toggle("main_container");
    let j = 0;
    for(let i = 1; i <= totalSeasons; i++){
        let new_container = document.createElement("div");
        new_container.classList.toggle("container");
        while(ratings[j].season == i){
            let new_item = document.createElement("div");
            new_item.classList.toggle("item");
            let text_node = document.createTextNode(ratings[j].rating);
            new_item.appendChild(text_node);
            new_container.appendChild(new_item);
            j++;
            if(ratings.length <= j){
                break;
            }
        }
        new_main_container.appendChild(new_container);
    }
    section.appendChild(new_main_container);
})();
