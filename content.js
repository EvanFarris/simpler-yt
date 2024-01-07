document.addEventListener("DOMContentLoaded",startPMObserver(null,null))

function startSuperObserver(tag) {
	const observer = new MutationObserver(startPMObserver)
	observer.tag = tag
	let elObs = document.getElementById("content")
	if(elObs){
		observer.observe(elObs, {childList: true, subtree: true})
	}
}

function startPMObserver(r, obs) {
	let pmo = document.getElementById("page-manager")
	if(pmo && (obs == null || obs.tag == "page-manager")){
		const observer = new MutationObserver(startSBObservers)
		observer.observe(pmo,{childList: true})
		if(obs != null){obs.disconnect()}
	} else if (obs == null){
		startSuperObserver("page-manager")
	}
}

function startSBObservers(r, obs) {
	let searchElements = document.getElementsByTagName("ytd-search")
	let browseElements = document.getElementsByTagName("ytd-browse")

	if(searchElements.length && !obs.hasOwnProperty("sytsearch")) {
		const searchContents = searchElements[0].querySelector("#contents")
		if(searchContents){
			const observer = new MutationObserver(searchCallback)
			observer.observe(searchContents,{childList: true, subtree: true})
			obs.sytsearch = true
		}
	}
	if(browseElements.length && !obs.hasOwnProperty("sytbrowse")) {
		const browseContents = browseElements[0].querySelector("#contents")
		if(browseContents)
		{
			const observer = new MutationObserver(browseCallback)
			observer.observe(browseContents,{childList: true, subtree: true})
			obs.sytbrowse = true
		}
	}
	
	if(searchElements.length && browseElements.length){
		obs.disconnect()
	}
}

function searchCallback(r,obs) {
	const sElement = document.getElementById("page-manager").getElementsByTagName("ytd-search")[0]
	if(!obs.hasOwnProperty("sytsections") || obs.syttitle != document.title){
		obs.sytsections = 1
		obs.sytelements = 0
		obs.syttitle = document.title
		obs.newTitle = true
	}
	if(sElement.hasAttribute("role") && sElement.getAttribute("role") == "main") {
		removeElements(sElement.querySelector("#contents"), obs)
	}
}

function browseCallback(r,obs) {
	const bElement = document.getElementById("page-manager").getElementsByTagName("ytd-browse")[0]
	if(!obs.hasOwnProperty("sytsections")){
		obs.sytsections = 1
		obs.sytelements = 0
		obs.syttitle = document.title
		obs.newTitle = true
	}
	if(bElement.hasAttribute("role") && bElement.getAttribute("role") == "main") {
		removeElements(bElement.querySelector("#contents"), obs)
	}
}

function removeElements(contents, obs) {
	const pContainers = contents.getElementsByTagName("ytd-item-section-renderer")

	if(pContainers && pContainers.length){
		if(pContainers.length > obs.sytsections && obs.newTitle){return}
		else if (pContainers.length > obs.sytsections) {
			obs.sytsections = pContainers.length
			obs.sytelements = 0
		} else {
				obs.newTitle = false
		}

		elementsToCheck = pContainers[pContainers.length - 1].children[2].childNodes

		if(elementsToCheck.length > obs.sytelements){
			removeTags(elementsToCheck, obs)
		}
	}
}

function removeTags(eList, obs) {
	const tSet = new Set(["ytd-reel-shelf-renderer","ytd-shelf-renderer", "ytd-rich-section-renderer", "ytd-playlist-renderer", "ytd-radio-renderer","ytd-horizontal-card-list-renderer", "ytd-movie-renderer"])
	for (let i = eList.length - 1; i >= obs.sytelements; i--){
		if(tSet.has(eList[i].tagName.toLowerCase())) {
			eList[i].remove()
		}
	}
	
	obs.sytelements = eList.length
}