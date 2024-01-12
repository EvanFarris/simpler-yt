document.addEventListener("DOMContentLoaded",startGenericObserver(null,null))

function startSuperObserver(tag) {
	//Function in line 5 was startPMObserver
	const observer = new MutationObserver(startGenericObserver)
	observer.tag = tag
	let elObs = document.getElementById("content")
	if(elObs){
		observer.observe(elObs, {childList: true, subtree: true})
	}
}

function startGenericObserver(r,obs) {
	let pmEle = document.getElementById("page-manager")
	if(pmEle){
		const observer = new MutationObserver(generalCallback)
		observer.observe(pmEle, {childList: true, attributeFilter: ["role"], subtree: true, attributeOldValue: true})
		if(obs != null){obs.disconnect()}
	} else if(obs == null){startSuperObserver("page-manager")}
}

function initObs(obs, isSearch, title, subtype){
	if(isSearch) {
		if(!obs.hasOwnProperty("sytsections") || obs.syttitle != document.title || !obs.prevSearch){
			obs.sytsections = 1
			obs.sytelements = 0
			obs.syttitle = title
			obs.newTitle = true
			obs.noInc = false
		}
		obs.prevSearch = true
	} else{
		if(!obs.hasOwnProperty("map")){obs.map = new Map()}
		if(!obs.map.has(subtype) || (obs.map.get(subtype))[0] != document.title){obs.map.set(subtype, [title, 0])}

		obs.prevSearch = false
	}
}

function worthyMutations(mutations) {
	const atToWatch = new Set(["ytd-browse","ytd-search"])
	const clToWatch = new Set(["ytd-page-manager", "ytd-watch-flexy"])
	let clMut = mutations.filter((m) => m.type == "childList" && (m.target.id == "contents" || clToWatch.has(m.target.localName)))
	let atMut = mutations.filter((m) => m.type == "attributes" && atToWatch.has(m.target.localName))
	console.log(clMut)
	if(clMut.length || atMut.length){
		return true
	}

	return false
}

function generalCallback(mutations,obs){
	if(!worthyMutations(mutations)){return}
	const mainElement = document.getElementById("page-manager").querySelector("ytd-browse[role='main'], ytd-search[role='main']")
	if(!mainElement){return}
	
	const tag = mainElement.tagName.toLowerCase()
	let isSearch, subtype = null
	
	if(tag == "ytd-search") {
		initObs(obs, true, document.title)
		isSearch = true
	} else if (tag == "ytd-browse") {
		subtype = mainElement.getAttribute("page-subtype")
		initObs(obs, false, document.title, subtype)
		isSearch = false
	} else {return}
	getElementsToCheck(mainElement.querySelector("#contents"), obs, isSearch, subtype)
}

function getElementsToCheck(contents, obs, isSearch, subtype) {
	let elementsToCheck, prevElementLength
	if (!isSearch){
		const exclusionSet = new Set(["history", "live", "news", "learning", "fashion"])
		if(subtype && exclusionSet.has(subtype)){return}
		elementsToCheck = contents.childNodes
		if(subtype=="home"){prevElementLength = 0}
		else{prevElementLength = (obs.map.get(subtype))[1]}
	} else {
		let pContainers = contents.getElementsByTagName("ytd-item-section-renderer")
		if(pContainers && pContainers.length){
			if(obs.newTitle && !obs.noInc && pContainers[0].querySelector("#contents") && pContainers[0].querySelector("#contents").childNodes.length == 1) {
				obs.sytsections++
				obs.noInc = true
			}
			if(pContainers.length > obs.sytsections && obs.newTitle){return}
			else if (pContainers.length > obs.sytsections) {
				obs.sytsections = pContainers.length
				obs.sytelements = 0
			} else if(obs.newTitle){
				obs.newTitle = false
			}
		} else {return}
		elementsToCheck = pContainers[pContainers.length - 1].children[2].childNodes
		prevElementLength = 0
	}
	if(elementsToCheck.length > prevElementLength) {
		removeTags(elementsToCheck, obs, prevElementLength, isSearch, subtype)
	}
}

function removeTags(eList, obs, prevLength, isSearch, subtype, title) {
	const tSet = new Set(["ytd-reel-shelf-renderer","ytd-shelf-renderer", "ytd-rich-section-renderer", "ytd-playlist-renderer", "ytd-radio-renderer","ytd-horizontal-card-list-renderer", "ytd-movie-renderer"])
	const cSet = new Set(['For You', 'Shorts', 'Trending Shorts'])
	
	let curTag
	//homepage regenerates shorts section
	for (let i = eList.length - 1; i >= prevLength; i--){
		curTag = eList[i].tagName.toLowerCase()
		
		if(tSet.has(curTag)) {
			removeElement(eList[i])
		} else if(curTag == "ytd-video-renderer") {
			videoLink = eList[i].getElementsByTagName("a")
			if(videoLink.length && videoLink[0].getAttribute("href").match(/shorts/)){removeElement(eList[i])} 
		} else if(curTag == "ytd-item-section-renderer"){
			spanExists = eList[i].querySelector("span#title")
			if(spanExists && cSet.has(spanExists.innerText)){removeElement(eList[i])}
		}
	}
	if(isSearch){obs.sytelements = eList.length}
	else {obs.map.set(subtype, [document.title, eList.length])}
}

function removeElement(e) {
	e.setAttribute("hidden", true)
}

function cprint(arr) {
	console.log(arr.join(' | '))
}