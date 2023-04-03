function createRenderer() {
    function render(vnode, container) {
        container.innerHTML = vnode
    }
    function hydrate(vnode, container) {

    }
    return {
        render,
        hydrate,
    }
}

export default createRenderer