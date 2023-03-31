import { track, trigger, ITERATE_KEY, MAP_KEY_ITERATE_KEY } from './responsive'
import { isMap, isSet } from './util'

const TriggerType = { 
    SET: 'SET',
    ADD: 'ADD'
 }
 // 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map()

const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function(...args) {
        // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
        let res = originMethod.apply(this, args)
        if (res === false || res === -1) {
            // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找，并更新 res 值
            res = originMethod.apply(this.raw, args)
        }
        // 返回最终结果
        return res
    }
})

 // 一个标记变量，代表是否进行追踪。默认值为 true，即允许追踪
 export let shouldTrack = true
  // 重写数组的 push、pop、shift、unshift 以及 splice 方法
 ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
    // 取得原始 push 方法
    const originMethod = Array.prototype[method]
    // 重写
    arrayInstrumentations[method] = function(...args) {
        // 在调用原始方法之前，禁止追踪
        shouldTrack = false
        // push 方法的默认行为
        let res = originMethod.apply(this, args)
        // 在调用原始方法之后，恢复原来的行为，即允许追踪
        shouldTrack = true
        return res
    }
 })

 // 抽离为独立的函数，便于复用
 function iterationMethod() {
    const target = this.raw
    const itr = target[Symbol.iterator]()
    const wrap = (val) => typeof val === 'object' ? reactive(val): val
    track(target, ITERATE_KEY)
    return {
        next() {
            const { value, done } = itr.next()
            return {
                value:  value ? [wrap(value[0]), wrap(value[1])] : value,
                done,
            }
        }
    }
 }

 function valuesIterationMethod() {
    // 获取原始数据对象 target
    const target = this.raw
    // 通过 target.values 获取原始迭代器方法
    const itr = target.values()
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val
    track(target, ITERATE_KEY)
    // 将其返回
    return {
        next() {
            const { value, done } = itr.next()
            return {
                // value 是值，而非键值对，所以只需要包裹 value 即可
                value: wrap(value),
                done
            }
        },
        [Symbol.iterator]() {
            return this
        }
    }
 }

 function keysIterationMethod() { 
    // 获取原始数据对象 target
    const target = this.raw
    // 获取原始迭代器方法
    const itr = target.keys()
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val
    // 调用 track 函数追踪依赖，在副作用函数与 MAP_KEY_ITERATE_KEY 之间建立响应联系
    track(target, MAP_KEY_ITERATE_KEY)
    // 将其返回
    return {
        next() {
            const { value, done } = itr.next()
            return {
                // value 是值，而非键值对，所以只需要包裹 value 即可
                value: wrap(value),
                done
            }
        },
        [Symbol.iterator]() {
            return this
        }
    }
 }

 // 定义一个对象，将自定义的 add 方法定义到该对象下
 const mutableInstrumentations = {
    add(key) {
        // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
        const target = this.raw
        // 先判断值是否已经存在
        const hadKey = target.has(key)
        // 通过原始数据对象执行 add 方法添加具体的值，注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
        const res = target.add(key) 
        // 调用 trigger 函数触发响应，并指定操作类型为 ADD
        if(!hadKey) {
            trigger(target, key, 'ADD')
        }
        // 返回操作结果
        return res
    },
    delete(key) {
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.delete(key)
        // 当要删除的元素确实存在时，才触发响应
        if (hadKey) {
            trigger(target, key, 'DELETE')
        }
        return res
    },
    get(key) {
        // 获取原始对象
        const target = this.raw
        // 判断读取的 key 是否存在
        const had = target.has(key)
        // 追踪依赖，建立响应联系
        track(target, key)
        // 如果存在，则返回结果。这里要注意的是，如果得到的结果 res 仍然是可代理的数据，则要返回使用 reactive 包装后的响应式数据
        if (had) {
            const res = target.get(key)
            return typeof res === 'object' ? reactive(res) : res
        }
    },
    set(key, value) {
        const target = this.raw
        const had = target.has(key)
        // 获取旧值
        const oldValue = target.get(key)
        // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时value.raw 不存在，则直接使用 value
        const rawValue = value.raw || value
        // 设置新值
        target.set(key, rawValue)
        // 如果不存在，则说明是 ADD 类型的操作，意味着新增
        if (!had) {
            trigger(target, key, 'ADD')
        } else if  (oldValue !== value || (oldValue === oldValue && value === value)) {
            // 如果不存在，并且值变了，则是 SET 类型的操作，意味着修改
            trigger(target, key, 'SET')
        }
    },
    forEach(callback, thisArg) {
        // wrap 函数用来把可代理的值转换为响应式数据
        const wrap = (val) => typeof val === 'object' ? reactive(val) : val
        // 取得原始数据对象
        const target = this.raw
        // 与 ITERATE_KEY 建立响应联系
        track(target, ITERATE_KEY)
        // 通过原始数据对象调用 forEach 方法，并把 callback 传递过去
        target.forEach((v, k) => {
            // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给callback，这样就实现了深响应
           callback.call(thisArg, wrap(v), wrap(k), this)
        })
    },
    // 共用 iterationMethod 方法
    [Symbol.iterator]: iterationMethod,
    entries: iterationMethod,
    values: valuesIterationMethod,
    keys: keysIterationMethod,
 }

 // 封装 createReactive 函数，接收一个参数 isShallow，代表是否为浅响应，默认为 false，即非浅响应, 增加第三个参数 isReadonly，代表是否只读，默认为 false，即非只读
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        // 拦截读取操作，接收第三个参数 receiver
        get: function (target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            if (key === 'size') {
                // 调用 track 函数建立响应联系
                track(target, ITERATE_KEY) 
                return Reflect.get(target, key, target)
            }

            if(isMap(target) || isSet(target)) {
                // 返回定义在 mutableInstrumentations 对象下的方法
                return mutableInstrumentations[key]
            }


            // 如果操作的目标对象是数组，并且 key 存在于arrayInstrumentations 上,那么返回定义在 arrayInstrumentations 上的值
            if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) { 
                return Reflect.get(arrayInstrumentations, key, receiver)
            }

            // 非只读的时候才需要建立响应联系, 如果 key 的类型是 symbol，则不进行追踪
            if (!isReadonly && typeof key !== 'symbol') {
                // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
                track(target, key)
            }
            // 得到原始值结果
            const res = Reflect.get(target, key, receiver)
            // 如果是浅响应，则直接返回原始值
            if (isShallow) {
                return res
            }
            if (typeof res === 'object' && res !== null) {
                // 调用 reactive 将结果包装成响应式数据并返回, 如果数据为只读，则调用 readonly 对值进行包装
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        },
        has: function (target, key) { 
            // 通过 has 拦截函数实现对 in 操作符的代理
            track(target, key)
            return Reflect.has(target, key)
        },
        ownKeys: function (target) {
            // 将副作用函数与 ITERATE_KEY 关联, 不存在得属性设置新属性值时促发
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        },
        // 拦截设置操作
        set: function (target, key, newVal, receiver) {
            // 如果是只读的，则打印警告信息并返回
            if (isReadonly) { 
                console.warn(`属性 ${key} 是只读的`)
                return true
            }
            // 先获取旧值
            const oldVal = target[key]

            // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
            const type = Array.isArray(target)
            // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度,如果是，则视作 SET 操作，否则是 ADD 操作
            ? Number(key) < target.length ? 'SET' : 'ADD'
            : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            // 设置属性值
            const res = Reflect.set(target, key, newVal, receiver)
            // target === receiver.raw 说明 receiver 就是 target 的代理对象
            if (target === receiver.raw) { 
                // 比较新值与旧值，只要当不全等，并且不都是 NaN 的时候才触发响应
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) { 
                    // 把副作用函数从桶里取出并执行
                    trigger(target, key, type, newVal)
                } 
            }
            // 防止'set' on proxy: trap returned falsish for property报错
            return res
        },
        deleteProperty: function(target, key) {
            // 如果是只读的，则打印警告信息并返回
            if (isReadonly) { 
                console.warn(`属性 ${key} 是只读的`)
                return true
            }
            // 检查被操作的属性是否是对象自己的属性
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            // 使用 Reflect.deleteProperty 完成属性的删除
            const res = Reflect.deleteProperty(target, key)
            if (res && hadKey) { 
                // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
                trigger(target, key, 'DELETE')
            }
            return res
        },
    })
}

export function reactive(obj) {
    const existionProxy = reactiveMap.get(obj)
    if (existionProxy) return existionProxy
    // 否则，创建新的代理对象
    const proxy = createReactive(obj)
    // 存储到 Map 中，从而避免重复创建
    reactiveMap.set(obj, proxy)
    return proxy
}

// 浅只读
export function shallowReactive(obj) { 
    return createReactive(obj, true /* shallow */, true)
}

export function readonly(obj) { 
    return createReactive(obj, false, true /* 只读 */)
}