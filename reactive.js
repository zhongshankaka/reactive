
const callbacks = new Map();

const reactivities = new Map();
let usedReactivities = [];

// Proxy 拦截对象
function reactive(object) {
  if (reactivities.has(object)) {
    return reactivities.get(object);
  }

  let proxy = new Proxy(object, {
    set(target, prop, value) {
      Reflect.set(target, prop, value);
      if (callbacks.get(target)) {
        // 4. 设置每次set响应式对象的属性值时，遍历调用注册的回调函数
        if (callbacks.get(target).has(prop)) {
          for (let callback of callbacks.get(target).get(prop)) {
            callback();
          }
        }
      }
    },
    get(target, prop) {
      // 2. 响应式对象的属性值每被get一次，统计需要做响应式处理的对象及其属性值
      usedReactivities.push([target, prop]);
      let value = Reflect.get(target, prop);
      if (typeof value === 'object') {
        return reactive(value);
      }
      return value;
    }
  });
  reactivities.set(object, proxy);
  return proxy;
}

// 注册响应回调函数
function effect(callback) {
  usedReactivities = [];
  // 1. 初始化代理对象 getter
  callback();
  // 3. 为统计出来的需要做响应式处理的对象的属性值，注册回调函数
  for (let [target, prop] of usedReactivities) {
    if (!callbacks.has(target)) {
      callbacks.set(target, new Map());
    }
    if (!callbacks.get(target).has(prop)) {
      callbacks.get(target).set(prop, []);
    }
    callbacks.get(target).get(prop).push(callback);
  }
}

console.log({usedReactivities})
console.log({reactivities})
console.log({callbacks})