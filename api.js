const base_url = 'https://thinkful-list-api.herokuapp.com/andrea/bookmarks';
//Fetch request 
const bookmarkFetch = function (...request) {
  let err;
  return fetch(...request)
    .then(response => {
      if(!response.ok){
        err = { code: response.status };
        if(!response.headers.get('conent-type').includes('json')) {
          err.message = response.statusText;
          return Promise.reject(err);
        }
      }
      return response.json();
    })
    .then(result => {
      if (err) {
        err.message = result.message;
        return Promise.reject(err);
      }
      return result;
    });
};

//GET bookmarks from API
const getBookmark = function (){
  return bookmarkFetch(`${base_url}`);
};

//POST boomark to API
const postBookmark = function (data) {
  return bookmarkFetch(`${base_url}`, {
    method: 'POST',
    headers:  { 'content-type': 'application/json' }, 
    body: data,
  });
};
//DELETE a bookmark from API
const deleteBookmark = function (id){
  return bookmarkFetch(`${base_url}/${id}`, {
    method: 'DELETE',
  });
};

export default {
  getBookmark,
  postBookmark,
  deleteBookmark,
};