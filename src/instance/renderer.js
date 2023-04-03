
function mountElement(vnode, container) {
    // 创建 DOM 元素
    const el = document.createElement(vnode.type)
    // 处理子节点，如果子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === 'string') {
        // 因此只需要设置元素的 textContent 属性即可
        el.textContent = vnode.children
    }
    // 将元素添加到容器中
    container.appendChild(el)
}

function createRenderer() {
    // n1：旧 vnode, n2：新 vnode, container：容器
    function patch(n1, n2, container) {
        // 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载
        if (!n1) {
            mountElement(n2, container)
        } else {
            // n1 存在，意味着打补丁
        }
    }
    function render(vnode, container) {
        if (vnode) {
            // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）操作,只需要将 container 内的 DOM 清空即可
                container.innerHTML = ''
            }
        }
        // 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
        container._vnode = vnode
    }
    function hydrate(vnode, container) {

    }
    return {
        render,
        hydrate,
    }
}

export default createRenderer