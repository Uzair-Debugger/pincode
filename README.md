
# 🚀 Pin Code

**A full-stack snippet management platform that helps developers capture, organize, search, and reuse code in seconds.**

---

## 💡 Why This Project Matters

Developers constantly lose time re-writing or searching for past code across chats, repositories, and scattered notes.

**Pin Code** solves this workflow gap with a centralized, searchable, and structured snippet workspace designed to improve daily development speed and consistency.

---

## ✨ Features

- Create, edit, and delete code snippets with language metadata  
- Organize snippets into nested collections (folder-style hierarchy)  
- Mark snippets as favorites for quick access  
- Search snippets by title, code content, and tags  
- Filter snippets by language and favorite status  
- Add notes for context and revision tracking  
- Secure authentication (signup, login, token refresh, logout)  
- Paginated snippet listing for scalable browsing  
- Protected APIs with validation and standardized error handling  

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)  
- React  
- TypeScript  
- Tailwind CSS  
- Axios  

### Backend
- Node.js  
- Express.js  
- TypeScript  
- Prisma ORM  
- PostgreSQL  
- Zod (schema validation)  
- JWT + HTTP-only refresh cookie authentication  
- bcrypt (password hashing)  

### Testing & Developer Tools
- Jest  
- Supertest  
- ESLint  
- ts-node-dev  

---

## 📸 Demo & Screenshots

### 🔗 Live Demo
> https://pincode-frontend.vercel.app

### 🖼 Screenshots
#### Login
![Login](/frontend/public/login.png)
#### Dashboard
![Pincode](/frontend/public/image.png)



---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+  
- npm  
- PostgreSQL  

---

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd pin-code
````

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
ALLOWED_ORIGINS=http://localhost:3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Run Prisma setup:

```bash
npm run prisma:generate
npm run prisma:migrate
```

(Optional) Seed database:

```bash
npm run prisma:seed
```

Start backend server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Start frontend server:

```bash
npm run dev
```

---

### 🌐 Local Development URLs

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend → [http://localhost:5000](http://localhost:5000)

---

## 🚀 Usage

1. Sign up for a new account (or log in)
2. Create your first snippet with title, language, and code
3. Add optional notes/tags and mark favorites
4. Organize snippets into collections
5. Use search and filters to quickly retrieve snippets
6. Manage related snippets within collections

---

## 🧠 Engineering Decisions & Challenges

* **Authentication Strategy**
  Implemented short-lived access tokens with refresh-token cookies to balance security and usability.

* **Search Optimization**
  Designed ranked search behavior where title matches are prioritized over code-only matches for better relevance.

* **Scalable Data Modeling**
  Used explicit many-to-many join tables (`SnippetTag`, `SnippetCollection`) to support extensibility.

* **Nested Collections**
  Implemented a self-referential schema to enable folder-like hierarchical organization.

* **Validation & Reliability**
  Enforced strict request validation using Zod and added integration tests for core modules.

* **Clean Architecture**
  Structured backend into routes, controllers, services, and repositories for maintainability and scalability.

---

## 🎯 Target Users

* Software engineers managing reusable code
* Coding bootcamp students building snippet libraries
* Teams maintaining internal code references
* Developers preparing for interviews or assessments

---

## 🔮 Future Improvements

* Syntax highlighting and in-browser formatting
* Public snippet sharing and team collaboration
* Advanced tag management and filtering
* Full-text search optimization and ranking controls
* Role-based access control for teams
* Dockerized setup with one-command bootstrap
* CI/CD pipeline with automated testing and linting

---

## 🧠 What This Project Demonstrates

**Pin Code is a production-grade full-stack project showcasing secure authentication, scalable backend architecture, relational data modeling, and a clean developer-focused user experience.**

