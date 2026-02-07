import { useEffect, useState } from "react";
import API_BASE_URL from "./api/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Frontend Connected to Backend</h1>
      <h2>Server Response:</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;