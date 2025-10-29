# 🚗 Vehicle Tracker UI (Frontend)

This is the frontend user interface for the Vehicle Tracker application, built with React, Vite, and React-Leaflet. It visualizes a vehicle's journey on an interactive map by fetching route data from a [corresponding backend API](https://github.com/your-username/vehicle-tracker-backend).

---

## ✨ Features

* **Interactive Map:** Uses **React-Leaflet** to display an interactive map.
* **Live Simulation:** Simulates the vehicle's movement along the route with "Play" and "Pause" controls.
* **Dynamic Polylines:** Renders the entire planned route (in gray) and the *traveled* route (in blue).
* **Rotating Vehicle Icon:** The vehicle icon smoothly animates and rotates to face the direction of travel.
* **Map Style Switcher:** Allows toggling between "Street" and "Satellite" map tiles.
* **Playback Slider:** A slider to "scrub" through the trip and view the vehicle's position at any point.

---

## 🛠️ Tech Stack

* **Framework:** [React.js](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Mapping:** [React-Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/)
* **Data Fetching:** [Axios](https://axios-http.com/)

---

## 🚀 How to Run Locally

### **Prerequisite: The Backend Must Be Running!**

This frontend application **requires** the [Spring Boot backend service](https://github.com/your-username/vehicle-tracker-backend) to be running on `http://localhost:8080` to fetch the route data.

---

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/vehicle-tracker-frontend.git](https://github.com/your-username/vehicle-tracker-frontend.git)
    cd vehicle-tracker-frontend
    ```

2.  **Install dependencies:**
    This will install React, Leaflet, Tailwind, and all other necessary packages.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Your browser will automatically open to `http://localhost:5173`.