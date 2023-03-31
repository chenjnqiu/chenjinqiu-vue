import { reactive } from './reactive'
// 封装一个 ref 函数
export function ref(val) {
    // 在 ref 函数内部创建包裹对象
    const wrapper = {
        value: val,
    }
    // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true,
    })
    // 将包裹对象变成响应式数据
    return reactive(wrapper)
}

// 封装一个toRef函数,防止展开符导致响应丢失问题
export function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key]
        }
    }
     // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
     Object.defineProperty(wrapper, '__v_isRef', {
        value: true,
    })
    return wrapper
}

// 封装toRefs,防止展开符导致响应丢失问题
export function toRefs(obj) {
    const ret = {}
    // 使用 for...in 循环遍历对象
    for (const key in obj) {
        // 逐个调用 toRef 完成转换
        ret[key] = toRef(obj, key)
    }
    return ret
}

// 将toRef转换后得value值，用proxy取回来, 组件中的 setup 函数所返回的数据会传递给 proxyRefs 函数进行处理
export function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver){
            const value = Reflect.get(target, key, receiver)
            // 自动脱 ref 实现：如果读取的值是 ref，则返回它的 value 属性值
            return value.__v_isRef ? value.value : value
        },
        set(target, key, newValue, receiver) {
            // 通过 target 读取真实值
            const value = target[key]
            // 如果值是 Ref，则设置其对应的 value 属性值
            if (value.__v_isRef) {
                value.value = newValue
                return true
            }
            return Reflect.set(target, key, newValue, receiver)
        }
    })
}