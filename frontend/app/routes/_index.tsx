//path: /

import { Link } from "react-router";

// ToDo: 
export default function Home() {
  return (
    <>
      <h1>Title</h1>
      <img src="/" alt="main_image" />
      <Link to="/animals">Кенты</Link>
      <Link to="/products">Продукты</Link>
    </>
  )
}