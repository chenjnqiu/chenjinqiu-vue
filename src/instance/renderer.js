import { 
    Text, 
    Comment,
    Fragment,
} from '../vdom/create-element'
import { reactive, shallowReactive } from '../observer/reactive'
import { lis } from '../util'
import queueJob from './scheduler'
import effect from '../observer/effect'

// 全局变量，存储当前正在被初始化的组件实例
let currentInstance = null
// 该方法接收组件实例作为参数，并将该实例设置为 currentInstance
function setCurrentInstance(instance) {
    currentInstance = instance
}

// resolveProps 函数用于解析组件 props 和 attrs 数据
function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    // 遍历为组件传递的 props 数据
    for (const key in propsData) {
        // 以字符串 on 开头的 props，无论是否显式地声明，都将其添加到 props数据中，而不是添加到 attrs 中
        if (key in options || key.startsWith('on')) {
            // 如果为组件传递的 props 数据在组件自身的 props 选项中有定义，则将其视为合法的 props
            props[key] = propsData[key]
        } else {
            // 否则将其作为 attrs
            attrs[key] = propsData[key]
        }
    }
    // 最后返回 props 与 attrs 数据
    return [ props, attrs ]
}

// 新旧得props变化是否
function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    // 如果新旧 props 的数量变了，则说明有变化
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i]
        // 有不相等的 props，则说明有变化
        if (nextProps[key] !== prevProps[key]) return true
    }
    return false
}

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
    function mountElement(vnode, container, anchor) {
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
        insert(el, container, anchor)
    }

    // 挂载组件
    function mountComponent(vnode, container, anchor) {
         // 通过 vnode 获取组件的选项对象，即 vnode.type
         const componentOptions = vnode.type
         // 获取组件的渲染函数 render
         const { render, data, setup, props: propsOption, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions
         // 在这里调用 beforeCreate 钩子
         beforeCreate && beforeCreate()
         // 调用 data 函数得到原始数据，并调用 reactive 函数将其包装为响应式数据
         const state = data ? reactive(data()) : null
         // 调用 resolveProps 函数解析出最终的 props 数据与 attrs 数据
         const [props, attrs] = resolveProps(propsOption, vnode.props)
          // 直接使用编译好的 vnode.children 对象作为 slots 对象即可
          const slots = vnode.children || {}
         // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
         const instance = {
            // 组件自身的状态数据，即 data
            state,
            // 将解析出的 props 数据包装为 shallowReactive 并定义到组件实例上
            props: shallowReactive(props),
            // 一个布尔值，用来表示组件是否已经被挂载，初始值为 false
            isMounted: false,
            // 组件所渲染的内容，即子树（subTree）
            subTree: null,
            slots,
            // 在组件实例中添加 mounted 数组，用来存储通过 onMounted 函数注册的生命周期钩子函数
            mounted: []
         }
         // 定义 emit 函数，它接收两个参数, event: 事件名称, payload: 传递给事件处理函数的参数
         function emit(event, ...payload) {
            // 根据约定对事件名称进行处理，例如 change --> onChange
            const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
            // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
            const handler = instance.props[eventName]
            if (handler) {
                // 调用事件处理函数并传递参数
                handler(...payload)
            } else {
                console.error('事件不存在')
            }
         }

         // 在调用 setup 函数之前，设置当前组件实例
         setCurrentInstance(instance)
         function onMounted(fn) {
            if (currentInstance) {
                // 将生命周期函数添加到 instance.mounted 数组中
                currentInstance.mounted.push(fn)
            } else {
                console.error('onMounted 函数只能在 setup 中调用')
            }
         }
         // setupContext，由于我们还没有讲解 emit 和 slots，所以暂时只需要attrs
         const setupContext = { attrs, emit, slots, onMounted }
         // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值，将 setupContext 作为第二个参数传递
         const setupResult = setup(shallowReadonly(instance.props), setupContext)
         // 在 setup 函数执行完毕之后，重置当前组件实例
         setCurrentInstance(null)
         // setupState 用来存储由 setup 返回的数据
         let setupState = null
         // 如果 setup 函数的返回值是函数，则将其作为渲染函数
         if (typeof setupResult === 'function') {
            if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略')
            // 将 setupResult 作为渲染函数
            render = setupResult
         } else {
            // 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
            setupState = setupResult
         }
         // 将组件实例设置到 vnode 上，用于后续更新
         vnode.component = instance
         // 创建渲染上下文对象，本质上是组件实例的代理
         const renderContext = new Proxy(instance, {
            get(t, k, r) {
                // 取得组件自身状态与 props 数据
                const { state, props, slots } = t
                // 当 k 的值为 $slots 时，直接返回组件实例上的 slots
                if (k === '$slots') return slots
                if (state && k in state) {
                    // 先尝试读取自身状态数据
                    return state[k]
                } else if (k in props) { 
                    // 如果组件自身没有该数据，则尝试从 props 中读取
                    return props[k]
                } else if (setupState && k in setupState){
                    // 渲染上下文需要增加对 setupState 的支持
                    return setupState[k]
                } else {
                    console.error('不存在')
                }
            },
            set (t, k, v, r) {
                const { state, props } = t
                if (state && k in state) {
                    state[k] = v
                }  else if (k in props) {
                    console.warn(`Attempting to mutate prop "${k}". Propsare readonly.`)
                } else if (setupState && k in setupState) {
                    // 渲染上下文需要增加对 setupState 的支持
                    setupState[k] = v
                } else {
                    console.error('不存在')
                }
            }
         })
         // 在这里调用 created 钩子
         created && created.call(renderContext)

         // 将组件的 render 函数调用包装到 effect 内
         effect(() => {
            // 调用 render 函数时，将其 this 设置为 state， 从而 render 函数内部可以通过 this 访问组件自身状态数据
            const subTree = render.call(renderContext, renderContext)
            // 检查组件是否已经被挂载
            if (!instance.isMounted) {
                // 在这里调用 beforeMount 钩子
                beforeMount && beforeMount.call(renderContext)
                // 初次挂载，调用 patch 函数第一个参数传递 null
                patch(null, subTree, container, anchor)
                // 重点：将组件实例的 isMounted 设置为 true，这样当更新发生时就不会再次进行挂载操作,而是会执行更新
                instance.isMounted = true
                // 在这里调用 mounted 钩子
                mounted && mounted.call(renderContext)
                // 遍历 instance.mounted 数组并逐个执行即可
                instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
            } else {
                // 在这里调用 beforeUpdate 钩子
                beforeUpdate && beforeUpdate.call(renderContext)
                // 当 isMounted 为 true 时，说明组件已经被挂载，只需要完成自更新即可，
                // 所以在调用 patch 函数时，第一个参数为组件上一次渲染的子树，思是，使用新的子树与上一次渲染的子树进行打补丁操作
                patch(instance.subTree, subTree, container, anchor)
                // 在这里调用 updated 钩子
                updated && updated.call(renderContext)
            }
            // 更新组件实例的子树
            instance.subTree = subTree       
         }, {
            // 指定该副作用函数的调度器为 queueJob 即可
            scheduler: queueJob
         })
    }

    // 简单diff算法
    function simpleDiff(n1, n2, container) {
        // 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及核心的Diff 算法
        const oldChildren = n1.children
        const newChildren = n2.children
        // 用来存储寻找过程中遇到的最大索引值
        let lastIndex = 0
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            let j = 0
            // 在第一层循环中定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，初始值为 false，代表没找到
            let find = false
            // 遍历旧的 children 
            for (j; j < oldChildren.length; j++) {
                const oldVNode = oldChildren[j]
                // 如果找到了具有相同 key 值的两个节点，说明可以复用，但仍然需要调用 patch 函数更新
                if (newVNode.key === oldVNode.key) {
                    // 一旦找到可复用的节点，则将变量 find 的值设为 true
                    find = true
                    patch(oldVNode, newVNode, container)
                    if (j < lastIndex) {
                        // 如果当前找到的节点在旧 children 中的索引小于最大索引值lastIndex,说明该节点对应的真实 DOM 需要移动
                        // 先获取 newVNode 的前一个 vnode，即 prevVNode
                        const prevVNode = newChildren[i - 1]
                        // 如果 prevVNode 不存在，则说明当前 newVNode 是第一个节点，它不需要移动
                        if (prevVNode) {
                            // 由于我们要将 newVNode 对应的真实 DOM 移动到prevVNode 所对应真实 DOM 后面，所以我们需要获取 prevVNode 所对应真实 DOM 的下一个兄弟节点，并将其作为锚点
                            const anchor = prevVNode.el.nextSibling
                            // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面，也就是 prevVNode 对应真实 DOM 的后面
                            insert(newVNode.el, container, anchor)
                        }
                    } else {
                        // 如果当前找到的节点在旧 children 中的索引不小于最大索引值，则更新 lastIndex 的值
                        lastIndex = j
                    }
                    break // 这里需要 break
                }
            }
            // 如果代码运行到这里，find 仍然为 false， 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点也就是说，当前 newVNode 是新增节点，需要挂载
            if (!find) {
                // 为了将节点挂载到正确位置，我们需要先获取锚点元素,首先获取当前 newVNode 的前一个 vnode 节点
                const prevVNode = newChildren[i - 1]
                let anchor = null
                if (prevVNode) {
                    // 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
                    anchor = prevVNode.el.nextSibling
                } else {
                    // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点,这时我们使用容器元素的 firstChild 作为锚点
                    anchor = container.firstChild
                }
                // 挂载 newVNod
                patch(null, newVNode, container, anchor)
            }
        }
        // 上一步的更新操作完成后,遍历旧的一组子节点
        for (let i = 0; i < oldChildren.length; i++) {
            const oldVNode = oldChildren[i]
            // 拿旧子节点 oldVNode 去新的一组子节点中寻找具有相同 key 值的节点
            const has = newChildren.find(vnode => vnode.key === oldVNode.key)
            if (!has) {
                // 如果没有找到具有相同 key 值的节点，则说明需要删除该节点调用 unmount 函数将其卸载
                unmount(oldVNode)
            }
        }
    }

    // 双端算法
    function patchKeyedChildren(n1, n2, container) {
        const oldChildren = n1.children
        const newChildren = n2.children
        // 四个索引值
        let oldStartIdx = 0
        let oldEndIdx = oldChildren.length - 1
        let newStartIdx = 0
        let newEndIdx = newChildren.length - 1
        // 四个索引指向的 vnode 节点
        let oldStartVNode = oldChildren[oldStartIdx]
        let oldEndVNode = oldChildren[oldEndIdx]
        let newStartVNode = newChildren[newStartIdx]
        let newEndVNode = newChildren[newEndIdx]

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            // 增加两个判断分支，如果头尾部节点为 undefined，则说明该节点已经被处理过了，直接跳到下一个位置
            if (!oldStartVNode) {
                oldStartVNode = oldChildren[++oldStartIdx]
            } else if (!oldEndVNode) {
                oldEndVNode = oldChildren[--oldEndIdx]
            } else if (oldStartVNode.key === newStartVNode.key) {
                // 第一步：oldStartVNode 和 newStartVNode 比较
                // 调用 patch 函数在 oldStartVNode 与 newStartVNode 之间打补丁
                patch(oldStartVNode, newStartVNode, container)
                // 更新相关索引，指向下一个位置
                oldStartVNode = oldChildren[++oldStartIdx]
                newStartVNode = newChildren[++newStartIdx]
            } else if (oldEndVNode.key === newEndVNode.key) {
                // 第二步：oldEndVNode 和 newEndVNode 比较
                // 节点在新的顺序中仍然处于尾部，不需要移动，但仍需打补丁
                patch(oldEndVNode, newEndVNode, container)
                // 更新索引和头尾部节点变量
                oldEndVNode = oldChildren[--oldEndIdx]
                newEndVNode = newChildren[--newEndIdx]
            } else if (oldStartVNode.key === newEndVNode.key) {
                // 第三步：oldStartVNode 和 newEndVNode 比较
                // 调用 patch 函数在 oldStartVNode 和 newEndVNode 之间打补丁
                patch(oldStartVNode, newEndVNode, container)
                // 将旧的一组子节点的头部节点对应的真实 DOM 节点 oldStartVNode.el移动到旧的一组子节点的尾部节点对应的真实 DOM 节点后面
                insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
                // 更新相关索引到下一个位置
                oldStartVNode = oldChildren[++oldStartIdx]
                newEndVNode = newChildren[--newEndIdx]
            } else if (oldEndVNode.key === newStartVNode.key) {
                // 第四步：oldEndVNode 和 newStartVNode 比较, 仍然需要调用 patch 函数进行打补丁
                patch(oldEndVNode, newStartVNode, container)
                // 移动 DOM 操作, oldEndVNode.el 移动到 oldStartVNode.el 前面
                insert(oldEndVNode.el, container, oldStartVNode.el)
                // 移动 DOM 完成后，更新索引值，并指向下一个位置 
                oldEndVNode = oldChildren[--oldEndIdx]
                newStartVNode = newChildren[++newStartIdx]
            } else {
                // 遍历旧的一组子节点，试图寻找与 newStartVNode 拥有相同 key 值的节点,idxInOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引
                const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key)
                // idxInOld 大于 0，说明找到了可复用的节点，并且需要将其对应的真实移动到头部
                if (idxInOld > 0) {
                    // idxInOld 位置对应的 vnode 就是需要移动的节点
                    const vnodeToMove = oldChildren[idxInOld]
                    // 不要忘记除移动操作外还应该打补丁
                    patch(vnodeToMove, newStartVNode, container)
                    // 将 vnodeToMove.el 移动到头部节点 oldStartVNode.el 之前，因此使用后者作为锚点
                    insert(vnodeToMove.el, container, oldStartVNode.el)
                    // 由于位置 idxInOld 处的节点所对应的真实 DOM 已经移动到了别处，因此将其设置为 undefined
                    oldChildren[idxInOld] = undefined
                    // 最后更新 newStartIdx 到下一个位置
                    newStartVNode = newChildren[++newStartIdx]
                } else {
                    // 将 newStartVNode 作为新节点挂载到头部，使用当前头部节点oldStartVNode.el 作为锚点
                    patch(null, newStartVNode, container, oldStartVNode.el)
                }
                newStartVNode = newChildren[++newStartIdx]
            }
        }
        // 循环结束后检查索引值的情况
        if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
            // 添加新节点
            // 如果满足条件，则说明有新的节点遗留，需要挂载它们
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                patch(null, newChildren[i], container, oldStartVNode.el)
            }
        } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
            // 移除操作
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                unmount(oldChildren[i])
            }
        }
    }

    // 快速算法
    function fastDiff(n1, n2, container) {
        const oldChildren = n1.children
        const newChildren = n2.children
        // 处理相同的前置节点, 索引 j 指向新旧两组子节点的开头
        let j = 0
        let oldVNode = oldChildren[j]
        let newVNode = newChildren[j]
        // while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
        while (oldVNode.key === newVNode.key) {
            // 调用 patch 函数进行更新
            patch(oldVNode, newVNode, container)
            // 更新索引 j，让其递增
            j++
            oldVNode = oldChildren[j]
            newVNode = newChildren[j]
        }
        // 更新相同的后置节点,索引 oldEnd 指向旧的一组子节点的最后一个节点
        let oldEnd = oldChildren.length - 1
        // 索引 newEnd 指向新的一组子节点的最后一个节点
        let newEnd = newChildren.length - 1
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
        // while 循环从后向前遍历，直到遇到拥有不同 key 值的节点为止
        while (oldVNode.key === newVNode.key) {
            // 调用 patch 函数进行更新
            patch(oldVNode, newVNode, container)
            // 递减 oldEnd 和 nextEnd
            oldEnd--
            newEnd--
            oldVNode = oldChildren[oldEnd]
            newVNode = newChildren[newEnd]
        }
        // 预处理完毕后，如果满足如下条件，则说明从 j --> newEnd 之间的节点应作为新节点插入
        if (j > oldEnd && j <= newEnd) {
            // 锚点的索引
            const anchorIndex = newEnd + 1
            // 锚点元素
            const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
            // 采用 while 循环，调用 patch 函数逐个挂载新增节点
            while (j <= newEnd) {
                patch(null, newChildren[j++], container, anchor)
            }
        } else if (j > newEnd && j <= oldEnd) {
            // j -> oldEnd 之间的节点应该被卸载
            while (j <= oldEnd) {
                unmount(oldChildren[j++])
            }
        } else {
            // 构造 source 数组,新的一组子节点中剩余未处理节点的数量
            const count = newEnd - j + 1
            const source = new Array(count)
            source.fill(-1)
            // oldStart 和 newStart 分别为起始索引，即 j
            const oldStart = j
            const newStart = j
            // 新增两个变量，moved 和 pos
            let moved = false
            let pos = 0
            // 构建索引表
            const keyIndex = {}
            for(let i = newStart; i <= newEnd; i++) {
                keyIndex[newChildren[i].key] = i
            }
            // 新增 patched 变量，代表更新过的节点数量
            let patched = 0
            // 遍历旧的一组子节点中剩余未处理的节点
            for(let i = oldStart; i <= oldEnd; i++) {
                oldVNode = oldChildren[i]
                // 如果更新过的节点数量小于等于需要更新的节点数量，则执行更新
                if (patched <= count) {
                    // 通过索引表快速找到新的一组子节点中具有相同 key 值的节点位置
                    const k = keyIndex[oldVNode.key]
                    if (typeof k !== 'undefined') {
                        newVNode = newChildren[k]
                        // 调用 patch 函数完成更新
                        patch(oldVNode, newVNode, container)
                        // 每更新一个节点，都将 patched 变量 +1
                        patched++
                        // 填充 source 数组
                        source[k - newStart] = i
                        // 判断节点是否需要移动
                        if (k < pos) {
                            moved = true
                        } else {
                            pos = k
                        }
                    } else {
                        // 没找到
                        unmount(oldVNode)
                    }
                } else {
                    // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的节点
                    unmount(oldVNode)
                }
            }
            if (moved) {
                // 如果 moved 为真，则需要进行 DOM 移动操作
                // 计算最长递增子序列
                const seq = lis(source)
                // s 指向最长递增子序列的最后一个元素
                let s = seq.length - 1
                // i 指向新的一组子节点的最后一个元素
                let i = count - 1
                // for 循环使得 i 递减
                for (i; i >= 0; i--) {
                    if (source[i] === -1) {
                        // 说明索引为 i 该节点在新 children 中的真实位置索引
                        const pos = i + newStart
                        const newVNode = newChildren[pos]
                        // 该节点的下一个节点的位置索引
                        const nextPos = pos + 1
                        // 锚点
                        const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                        // 挂载
                        patch(null, newVNode, container, anchor)

                    } else if (i !== seq[s]) {
                        // 如果节点的索引 i 不等于 seq[s] 的值，说明该节点需要移动
                        // 该节点在新的一组子节点中的真实位置索引
                        const pos = i + newStart
                        const newVNode = newChildren[pos]
                        // 该节点的下一个节点的位置索引
                        const nextPos = pos + 1
                        // 锚点
                        const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                        // 移动
                        insert(newVNode.el, container, anchor)
                    } else {
                        // 当 i === seq[s] 时，说明该位置的节点不需要移动,只需要让 s 指向下一个位置
                        s--
                    }
                }

            }
        }
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
                // // 简单算法
                // simpleDiff(n1, n2, container)
                // 双端算法
                // 封装 patchKeyedChildren 函数处理两组子节点
                // patchKeyedChildren(n1, n2, container)
                // 快速算法
                fastDiff(n1, n2, container)
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

    // 更新组件
    function patchComponent(n1, n2, anchor) {
        // 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component也指向组件实例
        const instance = (n2.component = n1.component)
        // 获取当前的 props 数据
        const { props } = instance
        // 调用 hasPropsChanged 检测为子组件传递的 props 是否发生变化，如果没有变化，则不需要更新
        if (hasPropsChanged(n1.props, n2.props)) {
            // 调用 resolveProps 函数重新获取 props 数据
            const [ nextProps ] = resolveProps(n2.type.props, n2.props)
            // 更新 props
            for (const k in nextProps) {
                props[k] = nextProps[k]
            }
            // 删除不存在的 props
            for (const k in props) {
                if (!(k in nextProps)) delete props[k]
            }
        }
    }


    // n1：旧 vnode, n2：新 vnode, container：容器
    function patch(n1, n2, container, anchor) {
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
                // 挂载时将锚点元素作为第三个参数传递给 mountElement 函数
                mountElement(n2, container, anchor)
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
            if (!n1) {
                // 挂载组件
                mountComponent(n2, container, anchor)
            } else {
                // 更新组件
                patchComponent(n1, n2, anchor)
            }
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