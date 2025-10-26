🧩 CRUD — The Four Main Database Operations
Operation	Full Form	What it Does	MongoDB Command
🧱 Create	Insert new data	Add new documents	insertOne(), insertMany()
🔍 Read	Retrieve data	Find or query documents	find(), findOne()
✏️ Update	Modify data	Change existing document fields	updateOne(), updateMany(), replaceOne()
🗑️ Delete	Remove data	Delete documents	deleteOne(), deleteMany()

These 4 cover 99% of what you’ll do in MongoDB directly.
But there are extra tools built on top of these for advanced operations (like sorting, aggregation, filtering, etc.), which we’ll see later.

🧱 1️⃣ Create (Insert)
➤ Insert One Document
db.users.insertOne({
  name: "Riya",
  age: 21,
  email: "riya@mail.com"
});

➤ Insert Many Documents
db.users.insertMany([
  { name: "Aryan", age: 23 },
  { name: "Meera", age: 20 }
]);


📘 MongoDB automatically creates the users collection if it doesn’t exist.

🔍 2️⃣ Read (Find)
➤ Get All Documents
db.users.find();

➤ Get Filtered Documents
db.users.find({ age: { $gt: 18 } });

➤ Get Single Document
db.users.findOne({ name: "Riya" });

➤ Add Projection (select specific fields)
db.users.find({}, { name: 1, email: 1, _id: 0 });


👉 You can even chain .sort(), .limit() and .skip() for pagination:

db.users.find().sort({ age: -1 }).limit(5);

✏️ 3️⃣ Update
➤ Update One
db.users.updateOne(
  { name: "Riya" },           // filter
  { $set: { age: 22 } }       // update
);

➤ Update Many
db.users.updateMany(
  { age: { $lt: 18 } },
  { $set: { status: "minor" } }
);

➤ Replace Entire Document
db.users.replaceOne(
  { name: "Riya" },
  { name: "Riya", age: 23, city: "Mumbai" }
);

🗑️ 4️⃣ Delete
➤ Delete One
db.users.deleteOne({ name: "Riya" });

➤ Delete Many
db.users.deleteMany({ age: { $lt: 18 } });
