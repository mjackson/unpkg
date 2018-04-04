import "./About.css";

import React from "react";

import contentHTML from "./About.md";

function About() {
  return (
    <div
      className="wrapper"
      dangerouslySetInnerHTML={{ __html: contentHTML }}
    />
  );
}

export default About;
