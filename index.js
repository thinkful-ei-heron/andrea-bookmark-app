import bookmarkList from './bookmark.js'; 


const main = function() {
  bookmarkList.bindEventListeners();
  bookmarkList.render();
};


$(main);
