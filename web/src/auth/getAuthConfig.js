import axios from 'axios'

export async function getAuthConfig (url) {
  return axios.post(url).then(response => {
    return response.data
  })
}