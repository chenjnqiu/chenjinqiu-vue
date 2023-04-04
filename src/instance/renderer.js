import { 
    Text, 
    Comment,
    Fragment,
} from '../vdom/create-element'


function createRenderer(options) {
    // 通过 options 得到操作 DOM 的 API
    const {
        createElement, 
        setElementText, 
        insert,
        patchProps,
        createText,
        setText,
        createComment,
    } = options

    // 卸载操作
    function unmount(vnode) {
        // 在卸载时，如果卸载的 vnode 类型为 Fragment，则需要卸载其 children
        if (vnode.type === Fragment) {
            vnode.children.forEach(c => unmount(c))
            return
        }
        // 获取 el 的父元素
        const parent = vnode.el.parentNode
        // 调用 removeChild 移除元素
        if (parent) parent.removeChild(vnode.el)
    }

    // 在这个作用域内定义的函数都可以访问那些 API
    function mountElement(vnode, container) {
        // 让 vnode.el 引用真实 DOM 元素
        const el = vnode.el = createElement(vnode.type)
        // 处理子节点，如果子节点是字符串，代表元素具有文本节点
        if (typeof vnode.children === 'string') {
            // 因此只需要设置元素的 textContent 属性即可
            setElementText(el, vnode.children)
        } else if(Array.isArray(vnode.children)) {
            // 如果 children 是数组，则遍历每一个子节点，并调用 patch 函数挂载它们
            vnode.children.forEach(child => {
                patch(null, child, el)
            })
        }
        // 如果 vnode.props 存在才处理它
        if (vnode.props) {
            // 遍历 vnode.props
            for (const key in vnode.props) {
                // 调用 patchProps 函数即可
                patchProps(el, key, null, vnode.props[key])
            }
        }
        // 调用 insert 函数将元素插入到容器内
        insert(el, container)
    }

    // 更新子节点
    function patchChildren(n1, n2, container) {
        // 判断新子节点的类型是否是文本节点
        if (typeof n2.children === 'string'){
            // 旧子节点的类型有三种可能：没有子节点、文本子节点以及一组子节点, 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况下什么都不需要
            if (Array.isArray(n1.children)) {
                n1.children.forEach((c) => unmount(c))
            }
            // 最后将新的文本节点内容设置给容器元素
            setElementText(container, n2.children)
        }  else if (Array.isArray(n2.children)) {
            // 说明新子节点是一组子节点, 判断旧子节点是否也是一组子节点
            if (Array.isArray(n1.children)) {
                // 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及核心的Diff 算法
                const oldChildren = n1.children
                const newChildren = n2.children

                // 遍历新的 children
                for (let i = 0; i < newChildren.length; i++) {
                    const newVNode = newChildren[i]
                    // 遍历旧的 children
                    for (let j = 0; j < oldChildren.length; j++) {
                        const oldVNode = oldChildren[j]
                        // 如果找到了具有相同 key 值的两个节点，说明可以复用，但仍然需要调用 patch 函数更新
                        if (newVNode.key === oldVNode.key) {
                            patch(oldVNode, newVNode, container)
                            break // 这里需要 break
                        }
                    }
                }

                // // 旧的一组子节点的长度
                // const oldLen = oldChildren.length
                // // 新的一组子节点的长度
                // const newLen = newChildren.length
                // // 两组子节点的公共长度，即两者中较短的那一组子节点的长度
                // const commonLength = Math.min(oldLen, newLen)
                // // 遍历 commonLength 次
                // for (let i = 0; i < commonLength.length; i++) {
                //     // 调用 patch 函数逐个更新子节点
                //     patch(oldChildren[i], newChildren[i], container)
                // }
                // // 如果 newLen > oldLen，说明有新子节点需要挂载
                // if (newLen > oldLen) {
                //     for (let i = commonLength; i < newLen; i++) {
                //         patch(null, newChildren[i], container)
                //     }
                // } else if (oldLen > newLen) {
                //     // 如果 oldLen > newLen，说明有旧子节点需要卸载
                //     for (let i = commonLength; i < oldLen; i++) {
                //         unmount(oldChildren[i])
                //     }
                // }
            } else {
                // 此时：旧子节点要么是文本子节点，要么不存在,但无论哪种情况，我们都只需要将容器清空，然后将新的一组子节点逐个挂载
                setElementText(container, '')
                n2.children.forEach(c => patch(null, c, container))
            }
        } else {
            // 代码运行到这里，说明新子节点不存在, 旧子节点是一组子节点，只需逐个卸载即可
            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => unmount(c))
            } else if (typeof n1.children === 'string') {
                // 旧子节点是文本子节点，清空内容即可
                setElementText(container, '')
            }
        }
    }

    // 更新
    function patchElement(n1, n2) {
        const el = n2.el = n1.el
        const oldProps = n1.props
        const newProps = n2.props
        // 第一步：更新 props
        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProps(el, key, oldProps[key], null)
            }
        }
        // 第二步：更新 children
        patchChildren(n1, n2, el)
    }


    // n1：旧 vnode, n2：新 vnode, container：容器
    function patch(n1, n2, container) {
        // 如果 n1 存在，则对比 n1 和 n2 的类型
        if (n1 && n1.type !== n2.type) {
            // 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载
            unmount(n1)
            n1 = null
        }
        // 代码运行到这里，证明 n1 和 n2 所描述的内容相同
        const { type } = n2
        // 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
        if (typeof type === 'string') {
             // 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载
            if (!n1) {
                mountElement(n2, container)
            } else {
                // n1 存在，意味着打补丁
                patchElement(n1, n2)
            }
        } else if (type === Text) {
            // 如果新 vnode 的类型是 Text，则说明该 vnode 描述的是文本节点,如果没有旧节点，则进行挂载
            if (!n1) {
                // 使用 createTextNode 创建文本节点
                const el = n2.el = createText(n2.children)
                // 将文本节点插入到容器中
                insert(el, container)
            } else {
                // 如果旧 vnode 存在，只需要使用新文本节点的文本内容更新旧文本节点即可
                const el = n2.el = n1.el
                if (n2.children !== n1.children) {
                    setText(el, n2.children)
                }
            }
        } else if (type === Comment) {
            // 如果新 vnode 的类型是 Text，则说明该 vnode 描述的是文本节点,如果没有旧节点，则进行挂载
            if (!n1) {
                // 使用 createTextNode 创建文本节点
                const el = n2.el = createComment(n2.children)
                // 将文本节点插入到容器中
                insert(el, container)
            } else {
                // 如果旧 vnode 存在，只需要使用新文本节点的文本内容更新旧文本节点即可
                const el = n2.el = n1.el
                if (n2.children !== n1.children) {
                    setText(el, n2.children)
                }
            }
        } else if (type === Fragment) {
            if (!n1) {
                // 如果旧 vnode 不存在，则只需要将 Fragment 的 children 逐个挂载即可
                n2.children.forEach(c => patch(null, c, container))
            } else {
                // 如果旧 vnode 存在，则只需要更新 Fragment 的 children 即可
                patchChildren(n1, n2, container)
            }
        } else if(typeof type === 'object') {
            // 如果 n2.type 的值的类型是对象，则它描述的是组件
        }
       
    }

    function render(vnode, container) {
        if (vnode) {
            // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 调用 unmount 函数卸载 vnode
                unmount(container._vnode)
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