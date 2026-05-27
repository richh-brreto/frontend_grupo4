import { useState } from "react";
import Card from "./components/login/card-form/Card";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);

    return (
        isLoggedIn? <Dashboard /> : <Card onLoginSuccess={setIsLoggedIn} />
    );
}

export default App;
