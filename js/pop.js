/**
 * popup
 */
const CUR = {'USD': '$', 'CAD': 'CA$', 'AUD': 'AU$', 'EUR': '€', 'GBP': '£', 'CNY': '¥'}
const CMC = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY='
const IMG = 'https://s2.coinmarketcap.com/static/img/coins/64x64/'
let myMoney = localStorage.getItem('currency')
let API = null

if (document.readyState !== 'loading') app()
else document.addEventListener('DOMContentLoaded', app)

function app() {
	document.removeEventListener('DOMContentLoaded', app)
	if (localStorage.getItem('currency') === null) localStorage.setItem('currency', 'USD')
	let convert = '&convert=' + myMoney
	if (myMoney !== 'USD') convert = '&convert=' + myMoney

	if (localStorage.getItem('apiKey') === null) document.getElementById('error').classList.remove('hide')
	else API = localStorage.getItem('apiKey')

	if (API !== null) getData(CMC + API + '&sort=market_cap&sort_dir=desc' + convert, myMoney)
}

function getData(url, money) {
	if (localStorage.getItem('coins') === null) localStorage.setItem('coins', ['Bitcoin', 'Ethereum', 'Dogecoin'].sort())
	let myCoins = localStorage.getItem('coins').toLowerCase().split(',')

	let get = new XMLHttpRequest()
	get.open('GET', url, true)
	get.send()
	get.onload = () => {
		if (get.status === 200) {
			let content = document.getElementById('content')
			while(content.firstChild) content.removeChild(content.firstChild)
			JSON.parse(get.response).data.forEach(c => {
				if (myCoins.indexOf(c.name.toLowerCase()) > -1) {
					showCoin(c.id, c.symbol, c.quote[`${money}`].price.toFixed(8), c.quote[`${money}`].percent_change_24h.toFixed(4))
				}
			})
		} else {
			let e = null
			document.getElementById('content').innerHTML('<p class="spinner"></p>')
			if (get.status === 400) e = 'Bad Request'
			if (get.status === 401) e = 'Unauthorized'
			if (get.status === 403) e = 'Forbidden'
			if (get.status === 429) e = 'Too Many Requests'
			if (get.status === 500) e = 'Internal Server Error'
			if (e !== null) {
				document.getElementById('error').classList.remove('hide')
				document.getElementById('error_message').innerHTML(e)
			} else document.getElementById('error').classList.add('hide')
		}
	}
}

function showCoin(id, symbol, price, change) {
	let bg = null
	if (change === 0) bg = ''
	else if (change > 0) {
		bg = 'up'
		change = '+' + change
	} else bg = 'down'

	let png = document.createElement('img')
	png.setAttribute('class', 'logo')
	png.setAttribute('src', `${IMG + id}.png`)

	let div = document.createElement('div')
	div.setAttribute('class', 'coin pop')
	if (bg !== null || bg !== '') div.classList.add(bg)
	document.getElementById('content').appendChild(div)
	div.appendChild(png)
	div.innerHTML = div.innerHTML + `<span class="ticker">${symbol}</span>: ${CUR[myMoney]}${price} <div class="_">(${change}%)</div>`
}