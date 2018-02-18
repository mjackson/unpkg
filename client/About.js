import React from "react";
import contentHTML from "./About.md";

const About = () => (
  <div className="wrapper" dangerouslySetInnerHTML={{ __html: contentHTML }} />
);

export default About;
