# Expense Tracker Application 💸

A full-stack Expense Tracker application built using **Spring Boot (Java)** for the backend and **React** for the frontend.  
This project is designed following **industry-standard architecture**, clean Git practices, and scalable coding principles.

---

## 🚀 Features (Implemented)
- User Registration
- User Login
- Secure authentication foundation
- Modular frontend & backend structure
- Clean Git commit history

---

## 🛠️ Tech Stack

### Backend
- Java 17+
- Spring Boot
- Spring Security
- JPA / Hibernate
- PostgreSQL
- Maven

### Frontend
- React (Vite)
- JavaScript (ES6+)
- CSS
- Axios

### Tools
- Git & GitHub
- IntelliJ IDEA
- VS Code
- Postman

---

## 📁 Project Structure

```text
expense-tracker/
│
├── backend/                           # Spring Boot Backend
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/omkar/expensetracker/
│   │   │   │
│   │   │   │   ├── ExpenseTrackerApplication.java
│   │   │   │
│   │   │   │   ├── config/               # App + Security configuration
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── JwtConfig.java
│   │   │   │   │   └── CorsConfig.java
│   │   │   │
│   │   │   │   ├── controller/           # REST Controllers (API layer)
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ExpenseController.java
│   │   │   │   │   └── CategoryController.java
│   │   │   │
│   │   │   │   ├── dto/                  # Request / Response DTOs
│   │   │   │   │   ├── request/
│   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   └── ExpenseRequest.java
│   │   │   │   │   └── response/
│   │   │   │   │       ├── JwtResponse.java
│   │   │   │   │       └── ExpenseResponse.java
│   │   │   │
│   │   │   │   ├── entity/               # JPA Entities
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Expense.java
│   │   │   │   │   └── Category.java
│   │   │   │
│   │   │   │   ├── repository/           # Data access layer
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── ExpenseRepository.java
│   │   │   │   │   └── CategoryRepository.java
│   │   │   │
│   │   │   │   ├── service/              # Business logic
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── ExpenseService.java
│   │   │   │   │   └── CategoryService.java
│   │   │   │
│   │   │   │   ├── service/impl/          # Service implementations
│   │   │   │   │   ├── AuthServiceImpl.java
│   │   │   │   │   └── ExpenseServiceImpl.java
│   │   │   │
│   │   │   │   ├── security/             # JWT filters & utils
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │
│   │   │   │   ├── exception/            # Global exception handling
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   └── ResourceNotFoundException.java
│   │   │   │
│   │   │   │   └── util/                 # Utilities & helpers
│   │   │   │       ├── DateUtils.java
│   │   │   │       └── MapperUtil.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── data.sql
│   │
│   ├── src/test/java/                     # Unit & integration tests
│   ├── pom.xml
│   └── README.md
│
├── frontend/                             # React Frontend (Vite)
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── api/                          # Axios API calls
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   └── expenseApi.js
│   │   │
│   │   ├── app/                          # App-level configs
│   │   │   ├── store.js
│   │   │   └── rootReducer.js
│   │   │
│   │   ├── assets/                       # Images, icons
│   │   │
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Loader/
│   │   │
│   │   ├── features/                     # Feature-based modules (KEY)
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── authSlice.js
│   │   │   │
│   │   │   ├── expense/
│   │   │   │   ├── ExpenseList.jsx
│   │   │   │   ├── AddExpense.jsx
│   │   │   │   ├── ExpenseChart.jsx
│   │   │   │   └── expenseSlice.js
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.jsx
│   │   │       └── SummaryCards.jsx
│   │   │
│   │   ├── hooks/                        # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── useDebounce.js
│   │   │
│   │   ├── layouts/                      # Page layouts
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   │
│   │   ├── routes/                       # Routing
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.js
│   │   │   └── currencyUtils.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── .gitignore
├── README.md                             # Root project README
└── docker-compose.yml (optional, future)

