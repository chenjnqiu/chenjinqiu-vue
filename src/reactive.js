import { track, trigger, ITERATE_KEY } from './responsive'

const TriggerType = { 
    SET: 'SET',
    ADD: 'ADD'
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
            // 非只读的时候才需要建立响应联系
            if (!isReadonly) {
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
            track(target, ITERATE_KEY)
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
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
            // 设置属性值
            const res = Reflect.set(target, key, newVal, receiver)
            // target === receiver.raw 说明 receiver 就是 target 的代理对象
            if (target === receiver.raw) { 
                // 比较新值与旧值，只要当不全等，并且不都是 NaN 的时候才触发响应
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) { 
                    // 把副作用函数从桶里取出并执行
                    trigger(target, key, type)
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
    return createReactive(obj)
}

// 浅只读
export function shallowReactive(obj) { 
    return createReactive(obj, true /* shallow */, true)
}

export function readonly(obj) { 
    return createReactive(obj, false, true /* 只读 */)
}