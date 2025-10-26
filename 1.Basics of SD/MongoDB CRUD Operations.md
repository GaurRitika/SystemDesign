## 🧩 CRUD — The Four Main Database Operations

| Operation      | Full Form       | What it Does                    | MongoDB Command                               |
| -------------- | --------------- | ------------------------------- | --------------------------------------------- |
| 🧱 **C**reate  | Insert new data | Add new documents               | `insertOne()`, `insertMany()`                 |
| 🔍 **R**ead    | Retrieve data   | Find or query documents         | `find()`, `findOne()`                         |
| ✏️ **U**pdate  | Modify data     | Change existing document fields | `updateOne()`, `updateMany()`, `replaceOne()` |
| 🗑️ **D**elete | Remove data     | Delete documents                | `deleteOne()`, `deleteMany()`                 |

These 4 cover **99% of what you’ll do** in MongoDB directly.
But there are **extra tools built on top of these** for advanced operations (like sorting, aggregation, filtering, etc.), which we’ll see later.

---

## 🧱 1️⃣ Create (Insert)

### ➤ Insert One Document

```js
db.users.insertOne({
  name: "Riya",
  age: 21,
  email: "riya@mail.com"
});
```

### ➤ Insert Many Documents

```js
db.users.insertMany([
  { name: "Aryan", age: 23 },
  { name: "Meera", age: 20 }
]);
```

📘 MongoDB automatically creates the `users` collection if it doesn’t exist.

---

## 🔍 2️⃣ Read (Find)

### ➤ Get All Documents

```js
db.users.find();
```

### ➤ Get Filtered Documents

```js
db.users.find({ age: { $gt: 18 } });
```

### ➤ Get Single Document

```js
db.users.findOne({ name: "Riya" });
```

### ➤ Add Projection (select specific fields)

```js
db.users.find({}, { name: 1, email: 1, _id: 0 });
```

👉 You can even chain `.sort()`, `.limit()` and `.skip()` for pagination:

```js
db.users.find().sort({ age: -1 }).limit(5);
```

---

## ✏️ 3️⃣ Update

### ➤ Update One

```js
db.users.updateOne(
  { name: "Riya" },           // filter
  { $set: { age: 22 } }       // update
);
```

### ➤ Update Many

```js
db.users.updateMany(
  { age: { $lt: 18 } },
  { $set: { status: "minor" } }
);
```

### ➤ Replace Entire Document

```js
db.users.replaceOne(
  { name: "Riya" },
  { name: "Riya", age: 23, city: "Mumbai" }
);
```

---

## 🗑️ 4️⃣ Delete

### ➤ Delete One

```js
db.users.deleteOne({ name: "Riya" });
```

### ➤ Delete Many

```js
db.users.deleteMany({ age: { $lt: 18 } });
```

---
 like that?
