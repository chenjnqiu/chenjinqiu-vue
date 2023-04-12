// 函数声明语句
const FunctionDeclNode = {
    type: 'FunctionDecl', // 代表该节点是函数声明函数的名称是一个标识符，标识符本身也是一个节点
    id: {
        type: 'Identifier',
        name: 'render', //  name 用来存储标识符的名称，在这里它就是渲染函数的名称 render
    },
    params: [], // 参数，目前渲染函数还不需要参数，所以这里是一个空数组
    //渲染函数的函数体只有一个语句，即 return 语句
    body: [{
        type: 'ReturnStatement',
        return: {
            type: 'CallExpression',
            // 被调用函数的名称，它是一个标识符
            callee: {
                type: 'Identifier',
                name: 'h'
            },
            // 参数
            arguments: [
                // 第一个参数是字符串字面量 'div'
                {
                    type: 'StringLiteral',
                    value: 'div'
                },
                // 第二个参数是一个数组
                {
                    type: 'ArrayExpression',
                    // 数组中的元素
                    elements: [
                        // 数组的第一个元素是 h 函数的调用
                        {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'h' },
                            arguments: [
                                // 该 h 函数调用的第一个参数是字符串字面量
                                { type: 'StringLiteral', value: 'p' },
                                // 第二个参数也是一个字符串字面量
                                { type: 'StringLiteral', value: 'Vue' },
                            ]
                        },
                        // 数组的第二个元素也是 h 函数的调用
                        {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'h' },
                            arguments: [
                                // 该 h 函数调用的第一个参数是字符串字面量
                                { type: 'StringLiteral', value: 'p' },
                                // 第二个参数也是一个字符串字面量
                                { type: 'StringLiteral', value: 'Template' },
                            ] 
                        }
                    ]
                }
            ]
        }
    }]
}

// 用来创建 StringLiteral 节点
export function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value
    }
}
// 用来创建 Identifier 节点
export function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}
// 用来创建 ArrayExpression 节点
export function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}
// 用来创建 CallExpression 节点
export function createCallExpression(callee, argumentParams) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments: argumentParams,
    }
}

// const CallExp = {
//     type: 'CallExpression',
//     // 被调用函数的名称，它是一个标识符
//     callee: {
//         type: 'Identifier',
//         name: 'h'
//     },
//     // 参数
//     arguments: []
// }
// const Str = {
//     type: 'StringLiteral',
//     value: 'div'
// }
// const Arr = {
//     type: 'ArrayExpression',
//     // 数组中的元素
//     elements: []
// }