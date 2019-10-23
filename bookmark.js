import api from './api.js';
import store from '../store.js';



// generates HTML for a bookmark

const createBookmarkHtml = function (item) {
  $('.listOfBookmarks').append(`
  <li id= "${item.id}">
    <form class= "expandElementButton">
      <button type="submit" class="titleAndRatingButton" aria-expanded="false"> 
        <div class="titleAndRating">
          <div class= "title"> 
            Title:<span class= "js-titleSpan"> ${item.title}</span>
          </div>
          <div class = "rating">
            Rating:<span class= "js-ratingSpan">${item.rating} Stars</span>
          </div>
        </div>
      </button>
    </form>
    <div class= "js-expandContent ${item.expanded ? '' : 'hidden'}" aria-live='polite'>
      <form action= "${item.url}" target="_blank">
        <label for= "visitSite" class="hidden"></label>
        <input class= "visitSiteButton" type="submit" value="View Site" id= "visitSite"/>
      </form>
      <p>${item.desc}</p>
      <form class= "js-DeleteButton">
        <button type= "submit" class="deleteBookmarkButton">Delete </button>
      </form>
    </div>
  </li>
  `);
};


const initializeStoreBookmarkList = function () {
  api.getBookmark()
    .then(data => Object.assign(store.DATA.allBookmarks, data))
    .then(() => store.DATA.allBookmarks.forEach(item => {
      item.expanded = false;
      createBookmarkHtml(item);}))
    .catch(error => {
      store.errorMessage(error);
      renderErrorMessage();
    });
};

//renders the main page
const render = function () {
  renderErrorMessage();
  $('.listOfBookmarks').html('');
  initializeStoreBookmarkList();
};

//will display add form
const displayForm = function () {
  if(store.DATA.adding) {
    $('.displayCreateBookmarkForm').html(`
    <form class= js-addNewBookmarkForm>
      <fieldset class= "bookmarkDetails">
        <div>
          <label for= "addBookmarkTitle">Title:</label>
        </div>
        <div>
          <input type= "text" id= "addBookmarkTitle" name="title" placeholder= "Add Title" required>
        </div>
        <div>
          <label for="addNewBookmarkUrl">Bookmark Website:</label>
        </div>
        <div>
          <input id= "addNewBookmarkUrl" type= url name="url" placeholder= "https://" required>
        </div>
        
        <div>
          <label for= "addBookmarkRating">Rating:</label>
        </div>
        <div>
          <select id="addBookmarkRating" name="rating" required>
            <option disabled>Stars</option>
            <option value=5>★★★★★</option>
            <option value=4>★★★★☆</option> 
            <option value=3>★★★☆☆</option> 
            <option value=2>★★☆☆☆</option> 
            <option value=1>★☆☆☆☆</option> 
          </select> 
        </div>
        <div>
          <label for="addBookmarkDescription">Description:</label>
        </div>
        <div>
          <textarea id="addBookmarkDescription" name="desc" placeholder= "Add description" ></textarea>
        </div>        
        <button type=submit> Create </button>
        <button type=reset>Cancel</button>
      </fieldset>
    </form>
    `);
  } else {
    $('.displayCreateBookmarkForm').html('');
  }
};

//handles when a user wants to add bookmark, changing adding to true, then displaying form
const handleNewSubmit = function () {
  $('.bookmarkMainForm').submit(function () {
    event.preventDefault();
    store.DATA.adding = true;
    displayForm();
  });
};

//will filter bookmark list based on value of rating
const filterBookmarkList = function () {
  const filterRatingsValue = store.DATA.filter;
  const filteredItems = store.DATA.allBookmarks.filter(item => item.rating >= filterRatingsValue);
  $('.listOfBookmarks').html('');
  filteredItems.forEach(item => createBookmarkHtml(item));
};

const handleFilterBySelection = function () {
  $('.filterByRating').change(function () {
    const filterByValue = $(this).val();
    store.DATA.filter = filterByValue;
    filterBookmarkList();
  });
};

//converts data with json.stringify to add to API
function serializeJson(form) {
  const formData = new FormData(form);
  const obj = {};
  formData.forEach((val, name) => obj[name] = val);
  return JSON.stringify(obj);
}

//POST to API
const makePostToApi = function (newData) {
  api.postBookmark(newData)
    .then(res => {
      store.addItems(res);
      filterBookmarkList();
    }).catch(error => {
      store.errorMessage(error);
      renderErrorMessage();
    });
};

const handleCreateBookmarkSubmit = function () {
  $('.displayCreateBookmarkForm').on('submit', '.js-addNewBookmarkForm', function () {
    event.preventDefault();
    const formElement = $('.js-addNewBookmarkForm')[0];
    const newData = serializeJson(formElement);
    store.DATA.adding = false;
    displayForm();
    makePostToApi(newData);
  });
};


const handleCancelButtonSubmit = function () {
  $('.displayCreateBookmarkForm').on('reset', '.js-addNewBookmarkForm', function () {
    store.DATA.adding = false;
    displayForm();
  });
};


const getElementById = function (id) {
  return store.DATA.allBookmarks.find(item => item.id === id);
};

/* will change the store value of expanded */
const toggleExpand = function (item) {
  item.expanded = !item.expanded;
  filterBookmarkList();
};
/* This will listen for a submit on the title and rating button.
when clicked it will change the value of the property expanded on the bookmark item
by calling toggleExpand. */

const handleClickToExpandListElement = function () {
  $('.listOfBookmarks').on('submit', '.expandElementButton', function (event) {
    event.preventDefault();
    const currentBookmarkId = $(event.currentTarget).closest('li').attr('id');
    let item = getElementById(currentBookmarkId);
    toggleExpand(item);
  });
};

//handles deletion of a bookmark form the server
const deleteFromServer = function (currentBookmarkId) {
  api.deleteBookmark(currentBookmarkId)
    .then(() => {
      store.removeItems(currentBookmarkId);
      filterBookmarkList();
    }).catch(error => {
      store.errorMessage(error);
      renderErrorMessage();
    });
};

const handleDeleteBookmarkSubmit = function () {
  $('.listOfBookmarks').on('submit', '.js-DeleteButton', function (event) {
    event.preventDefault();
    const currentBookmarkId = $(event.currentTarget).closest('li').attr('id');
    deleteFromServer(currentBookmarkId);
  });
};

//handles any errors
const errorHtmlRender = function (error) {
  return`
  <p> Something went wrong. The following error has occured:<span class="errorMessage"> ${error}</span></p>
  <form class="exitErrorMessage">
    <button class= "exitError" type= submit>Close</button>
  </form>`;
};

const renderErrorMessage = function () {
  if (store.DATA.error) {
    const message = errorHtmlRender(store.DATA.error);
    $('.errorDisplay').html(message);
  } else {
    $('.errorDisplay').html('');
  }
};

const closeErrorMessage = function () {
  $('.errorDisplay').on('submit', '.exitErrorMessage', function () {
    event.preventDefault();
    store.DATA.error = null;
    renderErrorMessage();
  });
};

const bindEventListeners = function () {
  handleNewSubmit();
  handleFilterBySelection();
  handleCreateBookmarkSubmit();
  handleCancelButtonSubmit();
  handleClickToExpandListElement();
  handleDeleteBookmarkSubmit();
  closeErrorMessage();
};

export default {
  bindEventListeners,
  render,
};
