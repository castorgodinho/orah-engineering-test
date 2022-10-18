import React, { useState } from "react"
import { Routes, Route } from "react-router-dom"
import "shared/helpers/load-icons"
import { RollcallContext } from "shared/helpers/rollcall-context"
import { StudentContext } from "shared/helpers/student-context"
import { RollInput } from "shared/models/roll"
import { Header } from "staff-app/components/header/header.component"
import { HomeBoardPage } from "staff-app/daily-care/home-board.page"
import { ActivityPage } from "staff-app/platform/activity.page"

function App() {

  const [stateList, setStateList] = useState([])
  const [students, setStudents] = useState([])

  return (
    <>
      <Header />
      <RollcallContext.Provider value={{ stateList, setStateList }}>
        <StudentContext.Provider value={{ students, setStudents }}>
        <Routes>
          <Route path="daily-care" element={<HomeBoardPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="*" element={<div>No Match</div>} />
        </Routes>
        </StudentContext.Provider>
      </RollcallContext.Provider>
      
    </>
  )
}

export default App
