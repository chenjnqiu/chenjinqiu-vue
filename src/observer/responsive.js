import { activeEffect } from './effect'
import { shouldTrack } from './reactive'
import { isMap, isSet } from '../util'

// 储存副作用桶
const bucket = new WeakMap()

// 设置对象不存在得属性时
export const ITERATE_KEY = Symbol()

// 设置map得key相关得
export const MAP_KEY_ITERATE_KEY = Symbol()

// 在 get 拦截函数内调用 track 函数追踪变化 
export function track(target, key) {
    // 没有 activeEffect或者当禁止追踪时，直接 return 
    if (!activeEffect || !shouldTrack) return target[key]
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
export function trigger(target, key, type, newVal) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // 取得与 key 相关联的副作用函数
    const effects = depsMap.get(key)
    const effectsToRun = new Set()
    // 将与 key 相关联的副作用函数添加到 effectsToRun
    effects && effects.forEach(effectFn => {
        // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
    // 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length属性相关联的副作用函数
    if (type === 'ADD' && Array.isArray(target)) { 
        // 取出与 length 相关联的副作用函数
        const lengthEffects = depsMap.get('length')
        // 将这些副作用函数添加到 effectsToRun 中，待执行
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    // 对于索引大于或等于新的 length 值的元素， 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中待执行
    if (Array.isArray(target) && key === 'length') { 
        depsMap.forEach((effects, key) => {
            if (key >= newVal) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
            }
        })
    }
    // 当操作类型为 ADD 或 DELETE 时，需要触发与 ITERATE_KEY 相关联的副作用函数重新执行
    if (type === 'ADD' || 
        type === 'DELETE' ||
        // 如果操作类型是 SET，并且目标对象是 Map 类型的数据，也应该触发那些与 ITERATE_KEY 相关联的副作用函数重新执行
        (type === 'SET' && isMap(target))
    ) {
        // 取得与 ITERATE_KEY 相关联的副作用函数
        const iterateEffects = depsMap.get(ITERATE_KEY)
        // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })

        // keys相关
        const iterateEffectKeys = depsMap.get(MAP_KEY_ITERATE_KEY)
        // 将与 MAP_KEY_ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
        iterateEffectKeys && iterateEffectKeys.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}