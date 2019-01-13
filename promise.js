const PEDDING = 'pedding';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise{
    constructor(executor){
        this.status = PEDDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        this.resolve = this.resolve.bind(this)
        this.reject = this.resolve.bind(this)
        try{
            executor(this.resolve, this.reject)
        }catch(e) {
            this.reject(e)
        }

    }
    resolve(value){
        if(this.status === PEDDING){
            this.status = FULFILLED;
            this.value = value;
            this.onResolvedCallbacks.forEach((fn) => {
                fn()
            })
        }
    }
    reject(reason) {
        if(this.status === PEDDING){
            this.status = REJECTED;
            this.reason = reason;
            this.onRejectedCallbacks.forEach((fn) => {
                fn()
            })
        }
    }
    resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            return reject(new TypeError('Circle Reference'))
        }
        // x 不一定是promise，可能成功失败都调用
        let called;
        if((typeof x === 'object' && x !== null) || typeof x === 'function') {
            try{
                let then = x.then;
                if(typeof then === 'function') {
                    then.call(x, (y) => {
                        called = true;
                        this.resolvePromise(promise2, x, resolve, reject)
                    }, (err) => {
                        if(called) return;
                        called = true;
                        reject(r);
                    })
                } else {
                    resolve(x);// 这就是一个普通对象 {}  {then:{}}
                }
            } catch(e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            console.log('x: ', x)
            resolve(x) // x是一个普通值
        }

    }
    then(onFulfilled, onRejected) {
        let that = this;
        let promise2;
        promise2 = new Promise((resolve, reject) => {
            if (that.status === FULFILLED) {
                setTimeout(() => {
                    try{
                        let x = onFulfilled(this.value);
                        console.log('fulfilled x: ', x);
                        that.resolvePromise(promise2, x, resolve, reject);
                    }catch(e){
                        reject(e)
                    }
                }, 0);
            }
            if (that.status === REJECTED) {
                setTimeout(() => {
                    try{
                        let x = onRejected(that.reason);
                        that.resolvePromise(promise2, x, resolve, reject);
                    }catch(e){
                        reject(e)
                    }
                }, 0);
            }
            if (that.status === PEDDING) {
                that.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            let x = onFulfilled(that.value);
                            that.resolvePromise(promise2, x, resolve, reject);
                        }catch(e){
                            reject(e)
                        }
                    }, 0);
                })
                that.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            let x = onRejected(that.reason);
                            that.resolvePromise(promise2, x, resolve, reject);
                        }catch(e){
                            reject(e)
                        }
                    }, 0);
                })
            }
        })
        return promise2;
    }
    catch(errCallback) {
        return this.then(null, errCallback);
    }
}

module.exports = Promise;