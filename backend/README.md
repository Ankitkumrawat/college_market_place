# College Student Marketplace Backend (FastAPI)

This is the backend API for the College Student Marketplace, built with FastAPI, SQLAlchemy ORM, and SQLite/PostgreSQL. It supports JWT authentication (restricted to students), product listing management, and real-time chat via REST and WebSockets.

---

## 🚀 Setup & Installation (Step-by-Step)

Follow these terminal commands from the root directory of the project to set up the environment and start the server:

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Set up a Python Virtual Environment
* **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
* **On Windows (CMD):**
  ```cmd
  python -m venv venv
  .\venv\Scripts\activate.bat
  ```
* **On macOS/Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```
Once running, you can access:
* **API Entrypoint:** `http://127.0.0.1:8000/`
* **Interactive Swagger UI (API Docs):** `http://127.0.0.1:8000/docs` (Use this to test endpoints immediately!)

---

## 🗄️ Database Configuration

By default, the backend uses a local SQLite database file `college_marketplace.db` so you can run it out of the box without any setup. 

To use **PostgreSQL**, update the `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```
*Replace `username`, `password`, and `dbname` with your PostgreSQL database credentials. When the server restarts, SQLAlchemy will automatically create all tables.*

---

## 🔗 Connecting the React Vite Frontend

To connect your React Vite frontend to this backend, configure Axios or Fetch to send request headers with the JWT token.

### 1. API Axios Instance Config
Create a file at `src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // FastAPI address
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
```

### 2. Update `AuthContext.jsx`
Replace the local-storage dummy logic with real backend HTTP calls:
```javascript
import api from '../services/api';

// --- Login Function ---
const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    // Fetch profile
    const profileResponse = await api.get('/api/auth/me');
    setCurrentUser(profileResponse.data);
    return { success: true, message: `Welcome back, ${profileResponse.data.name}!` };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Authentication failed' 
    };
  }
};

// --- Register Function ---
const register = async (name, email, password, branch, year) => {
  try {
    const response = await api.post('/api/auth/register', { 
      name, email, password, branch, year 
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    // Fetch profile
    const profileResponse = await api.get('/api/auth/me');
    setCurrentUser(profileResponse.data);
    return { success: true, message: 'Account created successfully!' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Registration failed' 
    };
  }
};
```

### 3. Update `AppContext.jsx`
Load and save products from the backend:
```javascript
import api from '../services/api';

// --- Fetch Products on Mount ---
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };
  fetchProducts();
}, []);

// --- Add Product Function ---
const addProduct = async (newProduct) => {
  try {
    const response = await api.post('/api/products', newProduct);
    setProducts(prev => [response.data, ...prev]);
    addNotification("Listing Created!", `Successfully listed "${response.data.title}".`);
  } catch (error) {
    console.error("Failed to post product:", error);
  }
};
```

### 4. Connect/Chat Feature using WebSockets
In React, you can establish a WebSocket connection in the Chat interface:
```javascript
const connectChat = (token) => {
  const socket = new WebSocket(`ws://127.0.0.1:8000/api/chat/ws/${token}`);
  
  socket.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);
    // Append message to active chat
    setChats(prev => prev.map(chat => {
      // Logic to append message to matching chat conversation
      return chat;
    }));
  };

  // Send message
  const send = (receiverId, productId, text) => {
    socket.send(JSON.stringify({
      receiver_id: receiverId,
      product_id: productId,
      text: text
    }));
  };
};
```
