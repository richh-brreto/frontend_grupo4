import axios from "axios";
import { useState } from "react";
import Card from "./components/login/card-form/Card";
import Dashboard from "./components/dashboard/Dashboard";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
const savedToken = localStorage.getItem("authToken");
if (savedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function App() {
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);

    return (
        isLoggedIn? <Dashboard /> : <Card onLoginSuccess={setIsLoggedIn} />
    );
}

export default App;
