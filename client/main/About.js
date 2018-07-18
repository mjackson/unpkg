import "./About.css";

import React from "react";

import html from "./About.md";

function About() {
  return <div className="wrapper" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default About;
