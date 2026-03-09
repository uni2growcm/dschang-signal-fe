import AlarmIcon from "@mui/icons-material/Alarm";
import Button from "@mui/material/Button";
import { Route, Routes } from "react-router-dom";
import "./App.css";

function Home() {
  return <h1 className="text-4xl">Home Page</h1>;
}

function Report() {
  return <h1 className="text-4xl">Report a Problem</h1>;
}

function Login() {
  return <h1 className="text-4xl">Login Page</h1>;
}

function App() {
  return (
    <div className="p-10" style={{ textAlign: "center" }}>
      <h1>Dschang's Signal</h1>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AlarmIcon />}
        style={{ marginTop: "1rem" }}
      >
        Test MUI
      </Button>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
