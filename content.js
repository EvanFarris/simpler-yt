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
		observer.observe(pmEle, {childList: true, attributes: true, subtree: true})
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
		}
		obs.prevSearch = true
	} else{
		if(!obs.hasOwnProperty("map")){obs.map = new Map()}
		if(!obs.map.has(subtype) || (obs.map.get(subtype))[0] != document.title){obs.map.set(subtype, [title, 0])}

		obs.prevSearch = false
	}
}

function generalCallback(r,obs){
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
	getElementsToCheck(mainElement.querySelector("#contents"), obs, isSearch, subtype=subtype)
}

function getElementsToCheck(contents, obs, isSearch, subtype) {
	const exclusionSet = new Set(["history", "live", "news", "learning", "fashion"])
	if(subtype && exclusionSet.has(subtype)){return}
	
	let elementsToCheck, prevElementLength
	if (!isSearch){
		elementsToCheck = contents.childNodes
		prevElementLength = (obs.map.get(subtype))[1]
	} else {
		let pContainers = contents.getElementsByTagName("ytd-item-section-renderer")
		if(pContainers && pContainers.length){
			if(pContainers.length > obs.sytsections && obs.newTitle){return}
			else if (pContainers.length > obs.sytsections) {
				obs.sytsections = pContainers.length
				obs.sytelements = 0
			} else {obs.newTitle = false}
		} else{
			return}
		elementsToCheck = pContainers[pContainers.length - 1].children[2].childNodes
		prevElementLength = 0
	}
	if(elementsToCheck.length > prevElementLength) {
		removeTags(elementsToCheck, obs, prevElementLength, isSearch, subtype)
	}
}

function removeTags(eList, obs, prevLength, isSearch, subtype, title) {
	const tSet = new Set(["ytd-reel-shelf-renderer","ytd-shelf-renderer", "ytd-rich-section-renderer", "ytd-playlist-renderer", "ytd-radio-renderer","ytd-horizontal-card-list-renderer", "ytd-movie-renderer"])
	const cSet = new Set(['For You', 'Shorts'])
	const stSet = new Set(["home", "subscriptions"])
	
	let curTag
	//homepage regenerates shorts section
	if(subtype && stSet.has(subtype)){prevLength = 0}
	for (let i = eList.length - 1; i >= prevLength; i--){
		curTag = eList[i].tagName.toLowerCase()
		if(tSet.has(curTag)) {eList[i].remove()} 
		else if(curTag == "ytd-video-renderer") {
			videoLink = eList[i].getElementsByTagName("a")
			if(videoLink.length && videoLink[0].getAttribute("href").match(/shorts/)){eList[i].remove()}
		} else if(curTag == "ytd-item-section-renderer"){
			spanExists = eList[i].querySelector("span#title")
			if(spanExists && cSet.has(spanExists.innerText)){eList[i].remove()}
		}
	}
	if(isSearch){obs.sytelements = eList.length}
	else {obs.map.set(subtype, [document.title, eList.length])}
}