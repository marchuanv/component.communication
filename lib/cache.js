const store = [];
function Cache() {}
Cache.prototype.find = (key) => {
    return store.find(x=>x.key === key).value;
};
Cache.prototype.set = (key, value) => {
    const existing = this.find({ key });
    if (existing) {
        existing.value = value;
    } else {
        store.push({ key, value });
    }
};
module.exports = { Cache };