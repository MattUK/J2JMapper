class Dictionary<K, V> {

    private items: Array<[K, V]>;

    public containsKey(keyToFind: K) {
        let foundKey = false;
        this.items.forEach(([key, value], index) => {
            if (key == keyToFind) foundKey = true;
        });
        return foundKey;
    }

    public containsValue(valueToFind: V) {
        let foundValue = false;
        this.items.forEach(([key, value], index) => {
            if (value == valueToFind) foundValue = true;
        });
        return foundValue;
    }

    public contains(keyToFind: K, valueToFind: V) {
        let foundEntry = false;
        this.items.forEach(([key, value], index) => {
            if (key == keyToFind && value == valueToFind) foundEntry = true;
        });
        return foundEntry;
    }

    private indexOf(keyToFind: K) {
        let index = -1;
        this.items.forEach(([key, value], idx) => {
            if (key == keyToFind) index = idx;
        });
        return index;
    }

    public get(keyToFind: K) {
        let itemIndex = this.indexOf(keyToFind);
        if (itemIndex >= 0) {
            let [key, value] = this.items[itemIndex];
            return value;
        } else {
            return null;
        }
    }

    public add(key: K, value: V) {
        this.items.push([key, value]);
    }

    public remove(keyToFind: K) {
        let index = this.indexOf(keyToFind);
        if (index >= 0) {
            this.items = this.items.splice(index, 1);
        }
    }

    public forEach(iterator: (key: K, value: V) => void) {
        this.items.forEach(([key, value], index) => {
            iterator(key, value);
        });
    }

}