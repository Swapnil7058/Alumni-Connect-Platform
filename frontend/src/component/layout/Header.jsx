import React from "react";
import Navbar from "../public_pages/shared/navbar";


export default function Header() {
  return (
    <header className="relative w-full">
      <Navbar />
      {/* Spacing hack: Since Navbar is 'fixed', 
        we need a div to push the rest of the content down 
      */}
      <div className="h-20 md:h-24"></div> 
    </header>
  );
}