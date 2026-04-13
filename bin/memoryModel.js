const { v4: uuidv4 } = require('uuid');

// Simple in-memory model factory that mimics a subset of Mongoose APIs used by the app.
// Supports: findOne, find, findById, findByIdAndUpdate, findByIdAndDelete, save().
// Query matching: direct equality and {$or: [{ field: value }, ...]}.

const stores = new Map();

const getStore = (name) => {
  if (!stores.has(name)) {
    stores.set(name, []);
  }
  return stores.get(name);
};

// Helper to get nested value by path (e.g. 'address.formatted')
const getValue = (obj, path) => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const matchesQuery = (doc, query = {}) => {
  if ('$or' in query && Array.isArray(query.$or)) {
    return query.$or.some((sub) => matchesQuery(doc, sub));
  }

  return Object.entries(query).every(([key, condition]) => {
    const val = getValue(doc, key);

    // Handle $regex operator
    if (condition && typeof condition === 'object' && '$regex' in condition) {
      const regex = new RegExp(condition.$regex, condition.$options || '');
      return regex.test(String(val || ''));
    }

    // Handle exact match
    return val === condition;
  });
};

function createMemoryModel(name) {
  const store = getStore(name);

  return class MemoryModel {
    constructor(data = {}) {
      this._id = data._id || uuidv4();
      Object.assign(this, data);
      if (!this.createdAt) this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      const idx = store.findIndex((item) => item._id === this._id);
      this.updatedAt = new Date();
      if (idx >= 0) {
        store[idx] = { ...store[idx], ...this };
      } else {
        store.push({ ...this });
      }
      return this;
    }

    static async findOne(query = {}) {
      const item = store.find((doc) => matchesQuery(doc, query));
      return item ? new MemoryModel(item) : null;
    }

    static async find(query = {}) {
      return store.filter((doc) => matchesQuery(doc, query)).map((doc) => new MemoryModel(doc));
    }

    static async findById(id) {
      const item = store.find((doc) => doc._id == id);
      return item ? new MemoryModel(item) : null;
    }

    static async findByIdAndUpdate(id, update = {}, options = {}) {
      const idx = store.findIndex((doc) => doc._id == id);
      if (idx === -1) return null;
      const current = store[idx];
      const next = { ...current, ...update, updatedAt: new Date() };
      store[idx] = next;
      return options.new ? new MemoryModel(next) : new MemoryModel(current);
    }

    static async findByIdAndDelete(id) {
      const idx = store.findIndex((doc) => doc._id == id);
      if (idx === -1) return null;
      const [removed] = store.splice(idx, 1);
      return new MemoryModel(removed);
    }

    static async deleteOne(query = {}) {
      const idx = store.findIndex((doc) => matchesQuery(doc, query));
      if (idx === -1) return { deletedCount: 0 };
      store.splice(idx, 1);
      return { deletedCount: 1 };
    }
  };
}

module.exports = { createMemoryModel };