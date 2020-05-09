export const COMMON_URL = 'http://localhost:7010/api';
// export const COMMON_URL = 'https://go.passerma.com/api'

export function FetchData(urlResult, params, callBack) {
    let url = `${COMMON_URL}${urlResult}`
    let opts = {
        ...params,
        credentials: 'include'
    }
    fetch(url, opts)
        .catch(err => {
            console.log(err)
            callBack();
        })
        .then(response => {
            return response.json();
        })
        .then(myJson => {
            callBack(myJson);
        })
}