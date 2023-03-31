const toString = Object.prototype.toString

export const toTypeString = (value) => toString.call(value)

// 判断map类型
export const isMap = (val) => toTypeString(val) === '[object Map]'
// 判断set类型
export const isSet = (val) => toTypeString(val) === '[object Set]'