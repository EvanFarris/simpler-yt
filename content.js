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
		//maybe call determineWhichToRemoveFrom here?
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
	if(sElement.hasAttribute("role") && sElement.getAttribute("role") == "main") {
		removeElements(sElement.querySelector("#contents"))
	}
}

function browseCallback(r,obs) {
	const bElement = document.getElementById("page-manager").getElementsByTagName("ytd-browse")[0]
	if(bElement.hasAttribute("role") && bElement.getAttribute("role") == "main") {
		removeElements(bElement.querySelector("#contents"))
	}
}

function removeElements(contents) {
	const pContainers = contents.getElementsByTagName("ytd-item-section-renderer")
	if(pContainers && pContainers.length){
		removeTags(pContainers[pContainers.length - 1].children[2])
	}

}
function removeTags(pElement) {
	const tSet = new Set(["ytd-reel-shelf-renderer","ytd-shelf-renderer", "ytd-rich-section-renderer", "ytd-playlist-renderer", "ytd-radio-renderer"])
	let pChildren = pElement.childNodes
	for (let i = pChildren.length - 1; i >= 0; i--){
		if(tSet.has(pChildren[i].localName)) {
			pChildren[i].remove()
		}
	}
}