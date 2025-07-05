import { BrowserRouter,Routes,Route } from "react-router-dom"
import { Toaster } from "sonner"
import Home from "./components/Home"
import Room from "./components/Room"

function App() {
  

  return (
    <BrowserRouter>
            <Toaster
              position="top-center"
              expand= {true}
              richColors
              theme="light"
              style={{
                fontFamily:"sans-serif"
              }}
            />
        <main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/room/:roomId" element={<Room/>} />
          </Routes>
        </main>
    </BrowserRouter>
  )
}

export default App
