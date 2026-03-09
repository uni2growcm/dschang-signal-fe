import React from "react";
import "./App.css";
import Button from "@mui/material/Button";
import AlarmIcon from "@mui/icons-material/Alarm";

function App() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Dschang's Signal</h1>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AlarmIcon />}
        style={{ marginTop: "1rem" }}
      >
        Test MUI
      </Button>
    </div>
  );
}

export default App;