📌 Task Management System (MERN)

A simple Task Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
This project helps users create, update, delete, and manage tasks with authentication.

🚀 Features

🔑 User Register & Login (JWT Authentication)

📝 Add, Edit, and Delete Tasks

✅ Mark tasks as Pending or Completed

🎯 Priority management (High, Medium, Low with colors)

📋 Paginated task list with filters

How to Run
1. Clone this repo
git clone https://github.com/bisenmanshi/task-Manage.git


2. Setup Backend
npm install

Create a .env file in backend/:

PORT=4000
MONGO_URI=mongo_connection_string
JWT_SECRET=random_secret_key


Start backend:

npm run dev

Setup Frontend

cd ../frontend
npm install
npm start