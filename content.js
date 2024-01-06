document.addEventListener("DOMContentLoaded",startObservers())
function startObservers() {
	const observer = new MutationObserver(() => removeElements())
	observer.observe(document.getElementById("contents"),{childList: true, subtree: true})
	removeElements()
}

function removeElements() {
	const pElement = document.getElementById("contents")
	if(pElement){
		const pContainers = pElement.getElementsByTagName("ytd-item-section-renderer")
		if(pContainers && pContainers.length){
			removeTags(pContainers[pContainers.length - 1].children[2])
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