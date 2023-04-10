const toString = Object.prototype.toString

export const toTypeString = (value) => toString.call(value)

// 判断map类型
export const isMap = (val) => toTypeString(val) === '[object Map]'
// 判断set类型
export const isSet = (val) => toTypeString(val) === '[object Set]'

// 最长排序
export function lis(nums) {
    const tails = [];
    for (let num of nums) {
      let l = 0, r = tails.length - 1;
      while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        if (tails[mid] < num) {
          l = mid + 1;
        } else {
          r = mid - 1;
        }
      }
      tails[l] = num;
    }
    return tails;
  }