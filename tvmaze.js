"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  let results = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  console.log(results, results.data, results.data[0], results.data[0].show.id);

  let arrOfObjects = results.data;
  let modifiedArr = [];
  for (let i = 0; i < arrOfObjects.length; i++) {
    let show = arrOfObjects[i].show;
    modifiedArr[i] = {
      id: `${show.id}`,
      name: `${show.name}`,
      summary: `${show.summary}`,
      image: `${
        show.image ? show.image.original : `https://tinyurl.com/tv-missing`
      }`,
    };
  }
  return modifiedArr;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= "${show.image}"
              alt="image for ${show.name}"
              class="card-img-top w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button id="${show.id}" class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const results = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let arrOfObjects = results.data;
  let modifiedArr = [];
  for (let i = 0; i < arrOfObjects.length; i++) {
    let episode = arrOfObjects[i];
    // console.log(episode)

    modifiedArr[i] = {
      id: `${episode.id}`,
      name: `${episode.name}`,
      season: `${episode.season}`,
      number: `${episode.number}`,
    };
  }
  return modifiedArr;
}

function populateEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    $episodesList.append(
      `<li>${episode.name} (season ${episode.season},  number ${episode.number})`
    );
  }
  $episodesArea.show();
}

async function getEpisodesAndPopulate(id) {
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on("click", function (evt) {
  getEpisodesAndPopulate(evt.target.id);
});
