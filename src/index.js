import flushJob, { jobQueue } from './scheduler' // 调度执行
import effect, { activeEffect, cleanup } from './effect'
import computed from './computed'
import { track, trigger } from './responsive'
import watch from './watch'

// 原始数据
const data = { foo: 1, bar: 2 }
// 对原始数据拦截(只有在拦截对象obj上面操作才会走get或者set方法，在原始数据data上面操作不会走get或者set方法)
const obj = new Proxy(data, {
    // 拦截读取操作
    get: function (target, key) {
        // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
        track(target, key)
        return target[key]
    },
    // 拦截设置操作
    set: function (target, key, newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        trigger(target, key)
        // 防止'set' on proxy: trap returned falsish for property报错
        return true
    }
})

// 全局变量
// let temp1, temp2

// // effectFn1 嵌套了 effectFn2
// effect(function effectFn1() {
//     console.log('effectFn1 执行')

//     effect(function effectFn2() {
//         console.log('effectFn2 执行')
//         // 在 effectFn2 中读取 obj.bar 属性
//         temp2 = obj.bar
//     })
//     // 在 effectFn1 中读取 obj.foo 属性
//     temp1 = obj.foo
// })

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
 const fetch = async (params) => {
    let m = 0
    setTimeout(() => {
        m =1
    }, 1000);
    return m
 }
 watch(
    // getter 函数
    () => obj.foo,
    // 回调函数
    async (newValue, oldValue, onInvalidate) => {
        console.log(newValue, oldValue)
        // 定义一个标志，代表当前副作用函数是否过期，默认为 false，代表没有过期
        let expired = false
        // 调用 onInvalidate() 函数注册一个过期回调
        onInvalidate(() => {
            // 当过期时，将 expired 设置为 true
            expired = true
        })
        // 发送网络请求
        const res = await fetch('/path/to/request')
        // 只有当该副作用函数的执行没有过期时，才会执行后续操作。
        if (!expired) {
            finalData = res
        }
    },
    {
        // 回调函数会在 watch 创建时立即执行一次
        immediate: true,
        // 回调函数会在 watch 创建时立即执行一次, 当 flush 的值为 'post' 时，代表调度函数需要将副作用函数放到一个微任务队列中
        // flush: 'pre' // 还可以指定为 'post' | 'sync'
    }
)

  // 修改响应数据的值，会导致回调函数执行
  obj.foo++
  setTimeout(() => {
    // 200ms 后做第二次修改
    obj.foo++
  }, 200)

 
