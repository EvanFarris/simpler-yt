document.addEventListener("DOMContentLoaded",startObservers(null,null))
function startObservers(records, obs) {
	let elObs = document.getElementById("contents")
	if(elObs && (obs == null || obs.tag == "contents")){
		console.log("contents observer started")
		const observer = new MutationObserver(removeElements)
		observer.observe(elObs,{childList: true, subtree: true})
		if(obs != null){obs.disconnect()}
		removeElements()
	} else if (obs == null){
		initialObserver("contents")
	}
	
	let flexyObs = document.getElementsByTagName("ytd-watch-flexy")
	if(flexyObs && flexyObs.length && (obs == null || obs.tag == "ytd-watch-flexy")){
		console.log("Flexy observer started")
		flexyObs = flexyObs[0]
		const flexyObserver = new MutationObserver(removeElements)
		flexyObserver.observe(flexyObs,{childList: true, subtree: true})
		if(obs != null){obs.disconnect()}
		removeElements()
	} else if (obs == null){
		initialObserver("ytd-watch-flexy")
	}
}

function initialObserver(tag) {
	const observer = new MutationObserver(startObservers)
	observer.tag = tag
	let elObs = document.getElementById("content")
	if(elObs){
		console.log("Watcher for: " + tag + " started")
		observer.observe(elObs, {childList: true, subtree: true})
	}
}
function removeElements(records, obs) {
	console.log("removeElements")
	const pElement = document.getElementById("contents")
	console.log(pElement)
	if(pElement){
		const pContainers = pElement.getElementsByTagName("ytd-item-section-renderer")
		console.log(pContainers)
		if(pContainers && pContainers.length){
			//if(obs){obs.disconnect()}
			removeTags(pContainers[pContainers.length - 1].children[2])
			//if(obs){obs.observe(pElement,{childList: true, subtree: true})}
		}
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