import React, { useState } from "react";
import Navbar from "./navbar.jsx";
import Menu from "./Sidebar.jsx";
import Events from "./events.jsx";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="overflow-hidden">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Menu isOpen={isSidebarOpen} />
    </div>
  );
}

export default App;
