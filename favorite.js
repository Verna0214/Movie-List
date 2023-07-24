const dataPanel = document.querySelector('#data-panel')
const baseURL = 'https://webdev.alphacamp.io'
const indexURL = baseURL + '/api/movies/'
const posterURL = baseURL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteList')) || []


// Render data function
function renderDataPanel(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col">
        <div class="card">
          <img src="${posterURL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button type="button" class="btn btn-primary btn-more" data-bs-toggle="modal" data-bs-target="#movie-model" data-id="${item.id}">More</button>
            <button type="button" class="btn btn-danger btn-delete" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// movie more detail function
function showMovie(id) {
  const modelTitle = document.querySelector('#model-title')
  const modelPoster = document.querySelector('#model-poster')
  const modelDate = document.querySelector('#model-date')
  const modelDescription = document.querySelector('#model-description')

  // 先清空上一筆資料，避免出現殘影
  modelTitle.textContent = ''
  modelPoster.src = ''
  modelDate.textContent = ''
  modelDescription.textContent = ''

  axios
    .get(indexURL + id)
    .then((response) => {
      const data = response.data.results

      modelTitle.textContent = data.title
      modelPoster.src = posterURL + data.image
      modelDate.textContent = data.release_date
      modelDescription.textContent = data.description
    })
    .catch(error => console.log(error))
}

// 有了id 要找到該筆資料
// 該筆資料放入陣列裡
// 陣列轉換成jSON格式存入localStorage
// add favorite movie
function deleteFavorite(id) {
  if (!movies || !movies.length) return
  
  const deleteIndex = movies.findIndex(item => item.id === id)
  if (deleteIndex === -1) return

  movies.splice(deleteIndex, 1)
  // 存回localStorage
  localStorage.setItem('favoriteList', JSON.stringify(movies))

  renderDataPanel(movies)
}



// dataPanel addEventListener
dataPanel.addEventListener('click', function clickMore(event) {
  const target = event.target

  if (target.classList.contains('btn-more')) {
    showMovie(Number(target.dataset.id))
  } else if (target.classList.contains('btn-delete')) {
    deleteFavorite(Number(target.dataset.id))
  }
})

renderDataPanel(movies)