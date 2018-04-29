import "./Home.css";

import React from "react";

import html from "../docs/home.md";

function Home() {
  return <div className="wrapper" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default Home;
