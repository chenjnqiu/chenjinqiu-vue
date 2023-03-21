 // 原始数据
const data = { text: 'hello world' }
// 储存副作用桶
const bucket = new Set()
// 对原始数据拦截(只有在拦截对象obj上面操作才会走get或者set方法，在原始数据data上面操作不会走get或者set方法)
const obj = new Proxy(data, {
    // 拦截读取操作
    get: function (target, key) { 
        bucket.add(effect)
        return target[key]
    },
    // 拦截设置操作
    set: function (target, key, newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用从桶里面取出来
        bucket.forEach(fn => fn())
        // 返回true代表操作成功
        return true
    }
})

function effect() {
    document.body.innerText = obj.text
}

// 执行副作用触发读取
effect()
// 1秒后修改响应式数据
setTimeout(() => {
    obj.text = 'hello vue3'
}, 2000)