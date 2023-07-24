const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const input = document.querySelector('#search-input')
const pageItem = document.querySelector('#page-item')
const switchPanel = document.querySelector('#switch-icon')
const baseURL = 'https://webdev.alphacamp.io'
const indexURL = baseURL + '/api/movies/'
const posterURL = baseURL + '/posters/'
const dataPerPage = 12
const movies = []
let searchData = []

axios
  .get(indexURL)
  .then((response) => {
    const dataArr = response.data.results
    movies.push(...dataArr)
    paginatorGenerate(movies.length)
    renderDataPanel(getMoviesByPage(1))  // render dataPanel
  })
  .catch(error => console.log(error))

// Render data function
function renderDataPanel(data) {
  dataPanel.removeAttribute('class')
  dataPanel.setAttribute('class', 'row row-cols-1 row-cols-md-4 g-4 mt-1 card-panel')
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
            <button type="button" class="btn btn-info btn-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderListPanel(data) {
  dataPanel.removeAttribute('class')
  dataPanel.setAttribute('class', 'list-panel mt-5')

  let rawHTML = `
    <ul class="list-group list-group-flush">
  `
  data.forEach((item) => {
    rawHTML += `
      <li class="list-group-item d-flex">
        <p class="me-auto" style="font-size: 20px;">${item.title}</p>
        <button type="button" class="btn btn-primary btn-more me-3" data-bs-toggle="modal" data-bs-target="#movie-model" data-id="${item.id}">More</button>
        <button type="button" class="btn btn-info btn-favorite" data-id="${item.id}">+</button>
      </li>
    `
  })

  rawHTML += `
    </ul>
  `
  dataPanel.innerHTML = rawHTML
  console.log(dataPanel)
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

// 也要有分頁資料
// Search movies function
function searchMovies(data) {
  
  // 避免輸入空值
  if (!data.length) {
    window.alert('欄位無資料，請重新確認！')
    return
  }

  // 掃描資料，留下符合條件的資料
  searchData = movies.filter(movie => movie.title.toLowerCase().includes(data))

  // 若搜無資料情形
  if (!searchData.length) {
    window.alert('查無電影，請重新輸入！')
    return
  }

  paginatorGenerate(searchData.length)

  if (dataPanel.classList.contains('list-panel')) {
    renderListPanel(getMoviesByPage(1))
  } else {
    renderDataPanel(getMoviesByPage(1))
  }

  input.value = ''
}

// 有了id 要找到該筆資料
// 該筆資料放入陣列裡
// 陣列轉換成jSON格式存入localStorage
// add favorite movie
function addFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteList')) || []
  const movie = movies.find(item => item.id === id)
  if (list.some(item => item.id === id)) {
    window.alert('該部電影已存放最愛清單中！')
    return
  }
  list.push(movie)
  localStorage.setItem('favoriteList', JSON.stringify(list))
}

// 分頁器設計
// 點擊頁面，要顯示該頁面的電影資料
// getMoviesByPage function
function getMoviesByPage(page) {
  const data = searchData.length > 0 ? searchData : movies
  const startPage = (page - 1) * dataPerPage

  return data.slice(startPage, startPage + dataPerPage)
}

// 分頁器的數量要拿總資料來除以每頁的資料
// 才能算出需要幾頁的分頁
function paginatorGenerate(data) {
  const pageNum = Math.ceil(data / dataPerPage)

  let rawHTML = ``
  for (let i = 1; i <= pageNum; i++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>
    `
  }

  pageItem.innerHTML = rawHTML
}


// dataPanel addEventListener
dataPanel.addEventListener('click', function clickMore (event) {
  const target = event.target
  
  if (target.classList.contains('btn-more')) {
    showMovie(Number(target.dataset.id))
  } else if (target.classList.contains('btn-favorite')) {
    addFavorite(Number(target.dataset.id))
  }
})


// 一、放置監聽器(preventDefault())
// 二、按下search button或enter時，取出input裡的value
// 三、將value拿來比對api裡results資料中的title（大小寫注意）
// 四、如果有包含value的資料，將其取出放入一個陣列裡
// 五、將該陣列渲染畫面
// search addEventListener (include click and enter)
searchForm.addEventListener('submit', function searchInputSubmit (event) {
  event.preventDefault()
  const inputValue = input.value.toLowerCase().trim()
  searchMovies(inputValue)
})

// 分頁掛上監聽
pageItem.addEventListener('click', function clickPage(event) {
  const target = event.target
  if (target.nodeName !== 'A') return

  const page = target.dataset.page

  if (dataPanel.classList.contains('list-panel')) {
    renderListPanel(getMoviesByPage(Number(page)))
  } else {
    renderDataPanel(getMoviesByPage(Number(page)))
  }
})

// switch 掛上監聽
switchPanel.addEventListener('click', function clickSwitch(event) {
  const target = event.target
  if (target.classList.contains('list-btn')) {
    renderListPanel(movies)
  } else if (target.classList.contains('card-btn')) {
    renderDataPanel(movies)
  }
})