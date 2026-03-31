# Inventory Manager – Voice‑Enabled DBMS Final Project

This project is a full‑stack inventory management system with:

- **Backend**: Python + Flask + MySQL (voice command engine and REST API)
- **Frontend**: React + Vite + TypeScript (modern dashboard UI)
- **Voice features**: Update stock and employees using natural‑language commands.

The repo is organized as:

- `backend/` – Flask API, MySQL connection, voice command parsing
- `frontend/` – Vite React app, inventory dashboard UI

---

## 1. Prerequisites

- **Python** 3.10+ with `pip`
- **Node.js** 18+ and **npm**
- **MySQL Server**

---

## 2. Database Setup (MySQL)

1. Start MySQL.
2. Run the SQL script:

```sql
SOURCE final.sql;
```

This creates the `final` database, tables like `Product`, `Category`, `Stock_Status` view, and some seed data (`notebook`, `pen`, etc.).

3. Update credentials in `backend/db_config.py` if needed:

```python
return mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="final",
)
```

---

## 3. Backend – Flask API + Voice Engine

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

Main files:

- `api.py` – Flask app exposing REST endpoints
- `voice_input.py` – microphone + SpeechRecognition helper (for CLI usage)
- `command_parser.py` – parses natural language commands
- `db_config.py` – MySQL connection helper

### Run backend locally

```bash
cd backend
python -c "from api import app; app.run(host='0.0.0.0', port=5001, debug=True)"
```

The backend will listen on: `http://127.0.0.1:5001`

### Key endpoints

- `GET /health` – health check
- `GET /products` – list products from MySQL
- `DELETE /products/<product_id>` – delete a product
- `POST /voice-command` – execute a natural‑language command:

  Request body:

  ```json
  { "command": "update keyboard to 10" }
  ```

  Supported actions:

  - **Inventory**
    - `"low stock"` → read low stock items from `Stock_Status` view
    - `"add 5 keyboard"` → add quantity
    - `"remove 2 keyboard"` → remove quantity
    - `"update keyboard to 10"` / `"set keyboard stock to 10"` → set quantity
  - **Employees**
    - `"show employees"` / `"show employee current shift"` → list employees in morning shift
    - `"add employee John morning"` → insert new employee
    - `"update John shift night"` → update employee shift

The response includes `status`, `message`, and for inventory actions, usually `product_name` and `new_quantity`.

---

## 4. Frontend – React + Vite Dashboard

### Install dependencies

```bash
cd frontend
npm install
```

### Configure API URL

The frontend uses Vite env variables. In `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:5001
```

### Run frontend

```bash
cd frontend
npm run dev
```

Vite dev server runs at: `http://localhost:8080`

---

## 5. Frontend Features

- **Dashboard**
  - Shows total products, low‑stock count, and recent activity.
  - Low‑stock list is derived from the in‑memory products (which are loaded from DB).

- **Products page**
  - Lists products grouped by category with search & filter.

- **Manage Stock**
  - **Quick Update**:
    - Type or speak commands like:
      - `"update keyboard to 30"`
      - `"add 5 notebook"`
      - `"remove 2 pen"`
    - Frontend sends the full text to `/voice-command`.
    - After a successful response, it reloads products from `/products` so the table reflects MySQL.
  - **Row Update**:
    - Enter a new quantity in the `New Qty` column and click **Update** to set that product’s stock.
  - **Delete**:
    - Click **Delete** to remove a product (calls `DELETE /products/:id` and updates UI + DB).

- **Add Item**
  - Form to add a product (name, category, quantity, description).
  - Sends a compatible `"add <qty> <name>"` command to `/voice-command`, then reloads products from the DB.

- **Voice Command page**
  - Large mic button with a minimum listening window so speech is captured reliably.
  - After you stop, the transcript is sent to `/voice-command`.
  - Result message and any low‑stock details are shown on screen.

---

## 6. Running Everything Together

In two terminals:

```bash
# Terminal 1 – backend
cd backend
python -c "from api import app; app.run(host='0.0.0.0', port=5001, debug=True)"

# Terminal 2 – frontend
cd frontend
npm run dev
```

Then open `http://localhost:8080` in your browser.

---

## 7. Notes / Limitations

- This setup is intended for **local demo / coursework**, not production.
- SQL queries in `api.py` are simple and focused on demonstrating DBMS concepts, not hardened security.
- Voice recognition uses the browser’s or Google’s SpeechRecognition APIs, so accuracy depends on microphone quality and environment.

