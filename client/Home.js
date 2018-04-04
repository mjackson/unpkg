import "./Home.css";

import React from "react";

import contentHTML from "./Home.md";

function Home() {
  return (
    <div
      className="wrapper"
      dangerouslySetInnerHTML={{ __html: contentHTML }}
    />
  );
}

export default Home;
