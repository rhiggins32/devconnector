const api = {
  clientId: process.env.REACT_APP_GITHUB_API_KEY,
  clientSecret: process.env.REACT_APP_GITHUB_API_SECRET,
  count: 5,
  sorted: 'created: asc'
};
 
export const getGithub = username =>
  fetch(
    `https://api.github.com/users/${username}/repos?per_page=${
      api.count
    }&sort=${api.sorted}&client_id=${api.clientId}&client_secret=${
      api.clientSecret
    }`
  )
  .then(res => res.json())
  .then(data => data)
  .catch(err => console.log(err));