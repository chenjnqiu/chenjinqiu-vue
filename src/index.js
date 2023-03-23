// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect 栈
const effectStack = [] // 新增

// effect 函数用于注册副作用函数
function effect(fn) {
    const effectFn = () => {
        // 调用 cleanup 函数完成清除工作
        cleanup(effectFn)
        // 当 effectFn 执行时，将其设置为当前激活的副作用函数
        activeEffect = effectFn
        // 在调用副作用函数之前将当前副作用函数压入栈中
        effectStack.push(effectFn)
        fn()
        // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect 还原为之前的值
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
    // 将 options 挂载到 effectFn 上
    effectFn.options = options // 新增
    // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
    effectFn.deps = []
    // 执行副作用函数
    effectFn()
}


// 原始数据
const data = { foo: 1 }
// 储存副作用桶
const bucket = new WeakMap()
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

effect(() => {
    console.log(obj.foo)
},
    // options
    {
        // 调度器 scheduler 是一个函数
        scheduler(fn) {
             
        }
    }
)

// 1秒后修改响应式数据
setTimeout(() => {
    // 副作用函数中并没有读取 notExist 属性的值
    // obj.text = 'hello vue3'
    // obj.bar = false
    // obj.foo = false
}, 2000)

// 在 get 拦截函数内调用 track 函数追踪变化 
function track(target, key) {
    // 没有 activeEffect，直接 return
    if (!activeEffect) return target[key]
    // 根据 target 从“桶”中取得 depsMap，它也是一个 Map 类型：key -->effects
    let depsMap = bucket.get(target)
    // 如果不存在 depsMap，那么新建一个 Map 并与 target 关联
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    // 再根据 key 从 depsMap 中取得 deps，它是一个 Set 类型，里面存储着所有与当前 key 相关联的副作用函数：effects
    let deps = depsMap.get(key)
    // 如果 deps 不存在，同样新建一个 Set 并与 key 关联
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    // 最后将当前激活的副作用函数添加到“桶”里
    deps.add(activeEffect)
    // deps 就是一个与当前副作用函数存在联系的依赖集合
    // 将其添加到 activeEffect.deps 数组中
    activeEffect.deps.push(deps) // 新增
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    const effectsToRun = new Set() // 新增
    effects && effects.forEach(effectFn => {
        // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => effectFn())
}

// 副作用执行时先清除之前的副作用
function cleanup(effectFn) {
    // 遍历 effectFn.deps 数组
    for (let i = 0; i < effectFn.deps.length; i++) {
        // deps 是依赖集合
        const deps = effectFn.deps[i]
        // 将 effectFn 从依赖集合中移除
        deps.delete(effectFn)
    }
    // 最后需要重置 effectFn.deps 数组
    effectFn.deps.length = 0
}