const storage = window.localStorage;

//#region local storage相关
function serialize(val) {
    return JSON.stringify(val);
}

function deserialize(val) {
    if (typeof val !== 'string') {
        return undefined;
    }
    try {
        return JSON.parse(val);
    } catch (e) {
        return val || undefined;
    }
}

/** 
 * 设置storage
 * @param {String} key key
 * @param {String} val val
*/
export function setStorage(key, val) {
    if (val === undefined) {
        return;
    }
    storage.setItem(key, serialize(val));
}

/** 
 * 获取storage
 * @param {String} key key
 * @param {String} def 不存在key返回的值
*/
export function getStorage(key, def) {
    const val = deserialize(storage.getItem(key));
    return val === undefined ? def : val;
}

/** 
 * 移除storage
 * @param {String} key key
*/
export function removeStorage(key) {
    storage.removeItem(key);
}

/** 
 * 清除storage
*/
export function clearStorage() {
    storage.clear();
}

/** 
 * 转化bace64
*/
export function getBase64 (img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
//#endregion