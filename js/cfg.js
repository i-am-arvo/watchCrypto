/**
 * settings
 */
const CMC = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY='
const IMG = 'https://s2.coinmarketcap.com/static/img/coins/64x64/'
let API = localStorage.getItem('apiKey')

if (document.readyState !== 'loading') app()
else document.addEventListener('DOMContentLoaded', app)

function app() {
	document.removeEventListener('DOMContentLoaded', app)
	let currency = document.getElementById('currency')
	while(currency.firstChild) currency.removeChild(currency.firstChild)
	const money = ['AUD', 'CAD', 'CNY', 'EUR', 'GBP', 'USD']
	const myMoney = localStorage.getItem('currency')
	for (i = 0; i < money.length; i++) {
		let opt = document.createElement('option')
		opt.appendChild(document.createTextNode(money[i]))
		opt.setAttribute('value', money[i])
		currency.appendChild(opt)
		if (money[i] === myMoney) currency.value = money[i]
	}

	if (API !== null) document.getElementById('apiKey').value = API

	let key = document.getElementById('apiKey')
	document.getElementById('setKey').onclick = () => {
		if (key.value.length !== 0) localStorage.setItem('apiKey', key.value.trim())
	}

	let coins = []
	document.getElementById('search').onclick = () => {
		if (coins.length === 0 && key.value.length > 0) {
			let get = new XMLHttpRequest()
			get.open('GET', CMC + API + '&sort=cmc_rank', true)
			get.send()
			get.onload = () => {
				if (get.status === 200) {
					let results = document.getElementById('results')
					while(results.firstChild) results.removeChild(results.firstChild)
					JSON.parse(get.response).data.forEach(c => {
						coins.push({name:c.name, ticker: c.symbol, logo: c.id + '.png'})
					})
				} else {
					let e = null
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
	}
	document.getElementById('search').onkeyup = () => search(coins)

	listCoins()
	selectCurrency()
}

function search(coins) {
	let results = document.getElementById('results')
	while(results.firstChild) results.removeChild(results.firstChild)
	let regExp = new RegExp(document.getElementById('search').value, 'i')

	if (document.getElementById('search').value.length === 0) {
		results.classList.add('hide')
		while(results.firstChild) results.removeChild(results.firstChild)
	} else {
		coins.forEach(c => {
			if (results.children.length < 8) {
				if (c.name.search(regExp) !== -1) {
					let name = c.name === c.name.toUpperCase() ? c.name.toLowerCase().split(' ') : c.name.split(' ')
					for (i = 0; i < name.length; i++) name[i] = name[i][0].toUpperCase() + name[i].substr(1)
					c.name = name.join(' ')
					let li = document.createElement('li')
					let png = document.createElement('img')
					png.setAttribute('class', 'logo')
					png.setAttribute('src', IMG + c.logo)
					li.appendChild(png)
					li.appendChild(document.createTextNode(c.name))
					li.setAttribute('class', 'coin add')
					li.onclick = () => { watchCoin(c.name) }
					results.appendChild(li)
					results.classList.remove('hide')
				}
			}
		})
	}
}

function addAPIkey(key) { if (key !== null && key !== '') localStorage.setItem('apiKey', key) }

function watchCoin(coin) {
	let myCoins = localStorage.getItem('coins').split(',')
	if (myCoins.indexOf(coin) !== -1) return false
	else {
		myCoins.push(coin)
		localStorage.setItem('coins', myCoins)
		document.getElementById('search').value = ''
		document.getElementById('results').innerHTML = ''
		listCoins()
	}
}

function selectCurrency() {
	let cur = document.getElementById('currency')
	cur.onchange = () => { localStorage.setItem('currency', cur.value) }
}

function listCoins() {
	document.getElementById('myCoins').innerHTML = ''
	let coins = localStorage.getItem('coins').split(',').sort()
	if (coins.length > 0 && coins[0] !== '') {
		for (i = 0; i < coins.length; i++) {
			let a = document.createElement('a')
			a.appendChild(document.createTextNode(coins[i]))
			a.setAttribute('class', 'btn btn-c smooth kill')
			a.setAttribute('id', coins[i])
			document.getElementById('myCoins').appendChild(a)
		}
		document.querySelectorAll('.kill').forEach(el => {
			let index = el.getAttribute('id')
			el.onclick = () => {
				if (coins.indexOf(index) !== -1 && coins.length > 1) coins.splice(coins.indexOf(index), 1)
				localStorage.setItem('coins', coins.sort())
				listCoins()
			}
		})
	}
}