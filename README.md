# Market Sell Application

This is a full-stack application designed to facilitate a marketplace where sellers can list products and customers can form groups to purchase them.

## Project Structure

The project is divided into two main parts: `backend` (Python/FastAPI) and `frontend` (React.js).

```
market_sell/
├── backend/                # Backend API built with FastAPI
│   ├── app/                # Application source code
│   ├── env/                # Python virtual environment
│   ├── lockdeal.db         # SQLite database file
│   ├── market.csv          # Sample data
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Directory for uploaded files (e.g., product images)
└── frontend/               # Frontend application built with React.js
    ├── public/             # Public assets
    ├── src/                # React source code
    │   ├── assets/         # Static assets (images, fonts)
    │   ├── components/     # Reusable React components
    │   ├── context/        # React Context API for global state
    │   ├── pages/          # React pages/views
    │   └── services/       # API service calls
    ├── package.json        # Node.js dependencies
    ├── tailwind.config.js  # Tailwind CSS configuration
```

## Features

### Customer Features
- Browse products.
- Join existing groups or create new ones.
- View dashboard with group status and savings.

### Seller Features
- Register and pay a one-time fee to activate the seller account.
- Upload products.
- Manage product listings and groups.
- View customer ratings.

## Setup Instructions

Follow these steps to set up and run the application locally.

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create a Python virtual environment and activate it:

```bash
python -m venv venv
# On Windows
.\env\Scripts\activate
# On macOS/Linux
source env/bin/activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Run the FastAPI application:

```bash
uvicorn app.main:app --reload
cd e:\market_sell\backend; python -m app.main 
```

The backend API will be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup

Open a new terminal, navigate to the `frontend` directory:

```bash
cd frontend
```

Install the Node.js dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend application will be running at `http://localhost:3000`.

## Usage

Once both the backend and frontend servers are running:

1. Open your web browser and go to `http://localhost:3000`.
2. Register as a new user (either customer or seller).
3. If you register as a seller, you will need to pay a 99 Rupee fee (dummy payment) to activate your account and access seller features.
4. Explore the customer and seller dashboards and functionalities.

## Technologies Used

- **Backend**: Python, FastAPI, SQLite
- **Frontend**: React.js, Tailwind CSS, React Router, Context API

## Contributing

Feel free to fork the repository and contribute. Pull requests are welcome.

## License

This project is open source and available under the MIT License.

when i  click on conform order then vo product search se remove ho jana chahiye and custmor side vo product ka card complete section me move hona chahiye from lock  section  ok and oderccompleted aisa show hona chahiye in custmor side and