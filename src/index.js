import flushJob, { jobQueue } from './observer/scheduler' // 调度执行
import effect, { activeEffect, cleanup } from './observer/effect'
import computed from './observer/computed'
import { track, trigger, ITERATE_KEY } from './observer/responsive'
import watch from './observer/watch'
import { reactive, shallowReactive, readonly } from './observer/reactive'
import { ref, toRefs, toRef, proxyRefs } from './observer/ref'
import createRenderer from './instance/renderer'
import { 
    createElement, 
    setElementText, 
    insert, 
    patchProps, 
    createText, 
    setText, 
    Text, 
    Comment,
    createComment,
    Fragment,
} from './vdom/create-element'
import { Teleport } from './core/components/index'
import compile, { tokenize, dump, traverseNode, transform } from './compiler/parse'

const renderer = createRenderer({
    createElement, setElementText, insert, patchProps, createText, setText, createComment
})

// const obj = {}
// const proto = { bar: 1 }
// const child = reactive(obj)
// const parent = reactive(proto)
//  // 使用 parent 作为 child 的原型
//  Object.setPrototypeOf(child, parent)
//  effect(() => {
//     console.log(child.bar)
//  })
//   // 修改 child.bar 的值
//   child.bar = 2 // 会导致副作用函数重新执行两次

// 深响应
// const obj = reactive({ foo: { bar: 1 } })
// effect(() => {
//     console.log(obj.foo.bar)
// })
// // 修改 obj.foo.bar 的值，并不能触发响应
// obj.foo.bar = 2

// 浅响应
// const obj = shallowReactive({ foo: { bar: 1 } })
// effect(() => {
//     console.log(obj.foo.bar)
// })
// // obj.foo 是响应的，可以触发副作用函数重新执行
// obj.foo = { bar: 2 }
// // obj.foo.bar 不是响应的，不能触发副作用函数重新执行
// obj.foo.bar = 3

// 只读
// const obj = readonly({ foo: 1 })
// effect(() => {
//     obj.foo // 可以读取值，但是不需要在副作用函数与数据之间建立响应联系
// })
// // 尝试修改数据，会得到警告
// obj.foo = 2

// // set
// const p = reactive(new Set([1, 2, 3]))
// // 第一个副作用函数
// effect(() => {
//     console.log(p.size)
// })
// p.add(4)
// p.delete(1)

// map
// const p = reactive(new Map([['key', 1]]))
// effect(() => {
//     console.log(p.get('key'))
// })
// p.set('key', 2) // 触发响应

// 迭代器
// const p = reactive(new Map([
//     ['key1', 'value1'],
//     ['key2', 'value2']
// ]))
// effect(() => {
//     for (const [key, value] of p) {
//         console.log(key, value)
//     }
// })
// p.set('key3', 'value3')

// 返回需要立即执行得函数
// const effectFn = effect(
//     // getter 返回 obj.foo 与 obj.bar 的和
//     () => obj.foo + obj.bar,
//     // options
//     {
//         // 调度器 scheduler 是一个函数
//         scheduler(fn) {
//             // 每次调度时，将副作用函数添加到 jobQueue 队列中
//             jobQueue.add(fn)
//             // 调用 flushJob 刷新队列
//             flushJob()
//         },
//         lazy: true, // 不会立即执行当前函数
//     }
// )

// 计算属性案列
// const sumRes = computed(() => obj.foo + obj.bar)
// // effect嵌套
// effect(function effectFn() {
//     console.log(sumRes.value)
// })
//  // 修改 obj.foo
//  obj.foo++

 // watch
//  watch(
//     // getter 函数
//     () => obj.foo,
//     // 回调函数
//     async (newValue, oldValue, onInvalidate) => {
//         console.log(newValue, oldValue)
//     },
//     {
//         // 回调函数会在 watch 创建时立即执行一次
//         immediate: true,
//         // 回调函数会在 watch 创建时立即执行一次, 当 flush 的值为 'post' 时，代表调度函数需要将副作用函数放到一个微任务队列中
//         // flush: 'pre' // 还可以指定为 'post' | 'sync'
//     }
// )


// 原始值
//  const name = ref('vue')
//  effect(() => {
//     console.log(name.value)
//  })
//  // 修改值可以触发响应
//  name.value = 'vue3'

//  const obj = reactive({ foo: 1, bar: 2 })
//  effect(() => {
//     console.log(proxyRefs({...toRefs(obj)}))

//  })
//  obj.foo = 2
//  obj.bar = 3 

// const vnode = {
//     type: 'h1',
//     // 使用 props 描述一个元素的属性
//     props: {
//         id: 'foo',
//         // 使用 onXxx 描述事件
//        onClick: [
//             // 第一个事件处理函数
//             () => {
//                 alert('clicked 1')
//             },
//             // 第二个事件处理函数
//             () => {
//                 alert('clicked 2')
//             }
//         ],
//         onContextmenu: () => {
//             alert('contextmenu')
//         }
//     },
//     children: [{
//         type: 'p',
//         children: 'hello' 
//     }, {
//         // 描述文本节点
//         type: Text,
//         children: '我是文本内容'
//     }, {
//         // 描述注释节点
//         type: Comment,
//         children: '我是注释内容'
//     }, {
//         type: 'ul',
//         children: [{
//             type: Fragment,
//             children: [
//                 { type: 'li', children: 'text 1', key: 1 },
//                 { type: 'li', children: 'text 2', key: 2 },
//                 { type: 'li', children: 'text 3', key: 3 }
//             ]
//         }]
//     }]
// }
// effect(() => {
//     renderer.render(vnode, document.querySelector('#app'))
// }) 

// const oldVNode = { 
//     type: 'div',
//     children: [
//         { type: 'p', children: '1', key: 1 },
//         { type: 'p', children: '2', key: 2 },
//         { type: 'p', children: 'hello', key: 3 },
//         // { type: 'p', children: '4', key: 4 },
//     ]
// }

// const newVNode = {
//     type: 'div',
//     children: [
//         { type: 'p', children: '4', key: 4 },
//         { type: 'p', children: '2', key: 2 },
//         { type: 'p', children: '1', key: 1 },
//         { type: 'p', children: 'world', key: 3 },
//     ]
// }

//  // 首次挂载
//  renderer.render(oldVNode, document.querySelector('#app'))
//  setTimeout(() => {
//     // 1 秒钟后更新
//     renderer.render(newVNode, document.querySelector('#app'))
//  }, 1000)

 
// 该 vnode 用来描述组件，type 属性存储组件的选项对象
const vnode = {
    type: 'div',
    props: {
        title: 'A big Title',
    },
    children: [{
        type: Teleport,
            props: {
                to: 'body',
            },
            children: [
                { type: 'h1', children: 'Title' },
                { type: 'p', children: 'content' }
            ]
    }]
}
renderer.render(vnode, document.querySelector('#app'))

const tokens = tokenize(`<div><p>Vue</p><p>Template</p></div>`)
const parseVal = compile(`<div><p>Vue</p><p>Template</p></div>`)
// console.log(tokens)
