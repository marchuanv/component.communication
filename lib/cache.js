const store = [];
function Cache() {}
Cache.prototype.find = function(key) {
    const found = store.find(x => x.key === key);
    if (found) {
        return found.value;
    } else {
        return null;
    }
};
Cache.prototype.set = function(key, value) {
    const existing = this.find({ key });
    if (existing) {
        existing.value = value;
    } else {
        store.push({ key, value });
    }
};
module.exports = { Cache };