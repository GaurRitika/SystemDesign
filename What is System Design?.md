### 📖 Storytime

You build a small web app — say, a notes website where users can save their notes.
At first, your architecture looks like this:

```
[User Browser]  --->  [Backend Server + Database]
```

* You host the backend on one server (say, AWS EC2).
* Database (say MySQL) runs on the same machine.
* Everything works fine for **10 users**.

Now imagine your app goes viral 🚀
100,000 users start saving notes at once.

Suddenly:

* Server becomes **slow** (too many requests).
* Database **crashes** (too many reads/writes).
* Some users can’t access their notes (system **unavailable**).
* Some notes vanish (**data loss**).

At this point, you realize:

> “Writing working code is easy.
> Making it work for *millions* of users is hard.”

That’s where **System Design** begins.

---

## 💡 Formal Definition

> **System Design** is the process of designing the **architecture**, **components**, and **data flow** of a system so that it can meet certain *functional* and *non-functional* requirements — like scalability, reliability, performance, and maintainability.

In simpler terms:

> “System Design = How different pieces (servers, databases, caches, queues, etc.) work together to handle millions of requests smoothly.”

---

## ⚙️ Functional vs Non-Functional Requirements

| Type                            | Meaning                          | Example                                                                                |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| **Functional Requirements**     | What the system must *do*        | “User can create, read, delete notes.”                                                 |
| **Non-Functional Requirements** | How well the system must perform | “It should handle 1M users”, “It should never lose notes”, “It should respond < 200ms” |

System design is mostly about **non-functional requirements**.

---

## 🧩 System Design ≠ Coding

System Design is about:

* **Architecture Thinking**
* **Scalability**
* **Reliability**
* **Availability**
* **Efficiency**

Code is just one *tiny* part of the system.

We ask questions like:

* “How will you scale your DB if you have 10M users?”
* “What happens if one server crashes?”
* “How to make sure user never loses their data?”
* “How to make the system respond in 200 ms worldwide?”

These are **design-level problems**, not algorithmic.

---

## 🧱 The Three Layers of Any System

Every modern web system roughly has 3 layers:

```
+-----------------------------+
|  Client Layer (Frontend)   |
|  e.g., browser, mobile app |
+-----------------------------+
            |
            v
+-----------------------------+
|  Application Layer (Backend)|
|  e.g., APIs, business logic |
+-----------------------------+
            |
            v
+-----------------------------+
|  Data Layer (Storage)       |
|  e.g., databases, cache     |
+-----------------------------+
```

---

## 🌍 Real-Life Analogy: The Restaurant Example 🍽️

Let’s map it to something real-world to make it intuitive.

| Restaurant Component | System Component  | Explanation                                    |
| -------------------- | ----------------- | ---------------------------------------------- |
| Customer             | User              | Sends requests (orders)                        |
| Waiter               | Load Balancer     | Takes request, sends it to kitchen             |
| Kitchen              | Server            | Prepares response (food)                       |
| Fridge               | Database          | Stores ingredients (data)                      |
| Ready-to-eat shelf   | Cache             | Stores most frequent dishes for faster serving |
| Manager              | Monitoring System | Ensures everything runs smoothly               |

System Design = designing this *entire restaurant*, so even if **1000 customers** come, the service remains fast and reliable.

---

## ⚖️ Why System Design Matters

| Company       | Scale                          | Example of Design Problem              |
| ------------- | ------------------------------ | -------------------------------------- |
| **Instagram** | Billions of images             | How to store and serve images globally |
| **YouTube**   | 500+ hours uploaded per minute | How to process and stream efficiently  |
| **Amazon**    | Millions of transactions/sec   | How to ensure payments are atomic      |
| **Netflix**   | Millions watching HD video     | How to deliver low latency streams     |
| **Uber**      | Millions of drivers & riders   | How to match in real time              |

All of these are **system design challenges**.

---

## 🧠 The 5 Core Goals of System Design

| Goal                   | Meaning                            | Example                               |
| ---------------------- | ---------------------------------- | ------------------------------------- |
| **1. Scalability**     | Can handle growth in users or data | Add more servers if users double      |
| **2. Availability**    | System rarely goes down            | Server failure shouldn’t stop service |
| **3. Reliability**     | Data is accurate and consistent    | No message duplication or loss        |
| **4. Performance**     | Fast response times                | <200ms per request                    |
| **5. Maintainability** | Easy to modify, deploy, or debug   | Clear modules, logs, and monitoring   |

---

## 🧭 The Two Sides of System Design

There are two broad categories:

### 1. **High-Level System Design (HLD)**

Focus: Architecture & components.

Questions like:

* “Design Netflix.”
* “Design URL shortener.”
* “Design WhatsApp.”

We draw diagrams and explain how components interact.

---

### 2. **Low-Level Design (LLD)**

Focus: Internal logic and data models.

Questions like:

* “Design class diagram for elevator system.”
* “How would you design parking lot software?”

You define classes, relationships, methods — more like object-oriented design.

---

## 🧠 Example: How a Request Travels in a System

Let’s say a user visits:
👉 `https://instagram.com/r`

Here’s what happens step-by-step:

```
User Browser → DNS → Load Balancer → Web Server → Cache → Database
                                       ↓
                                   Response back
```

1. **DNS** converts domain name to IP.
2. **Load Balancer** picks one web server (to distribute traffic).
3. **Web Server** receives request.
4. It checks **Cache** (Redis/CDN) for fast retrieval.
5. If not found, fetches from **Database**.
6. Returns result to the user.

Every single one of those steps is a **system component** you’ll learn to design.

---

## 🏗️ Example Interview Flow (Preview)

When interviewer says:

> “Design Instagram.”

You’ll follow this order:

1. Clarify requirements (what features, scale, goals)
2. Define APIs
3. Design high-level architecture
4. Identify key components (DB, cache, queue)
5. Discuss scaling, load balancing, availability
6. Mention trade-offs & failure handling

We’ll practice all of these one by one.

---

## 🧩 Summary 

| Concept           | Meaning                                                         |
| ----------------- | --------------------------------------------------------------- |
| **System Design** | Art of architecting systems that handle large scale efficiently |
| **Goal**          | Scalability, Availability, Reliability, Performance             |
| **Layers**        | Client → Backend → Data                                         |
| **Two Types**     | High-Level (architecture) and Low-Level (class design)          |
| **Real Use**      | Every big company uses it to design their core systems          |

---


