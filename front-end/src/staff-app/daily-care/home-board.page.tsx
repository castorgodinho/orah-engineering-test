import React, { useState, useEffect, useContext } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person, PersonHelper } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { StudentContext } from "shared/helpers/student-context"
import { RollInput, RolllStateType } from "shared/models/roll"
import { RollcallContext } from "shared/helpers/rollcall-context"

export const HomeBoardPage: React.FC = () => {

  const [isRollMode, setIsRollMode] = useState(false)
  const [sortField, setSortField] = useState('first_name')
  const [sortOrder, setSortOrder] = useState('desc')
  const [search, setSearch] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const { students, setStudents } = useContext(StudentContext);
  const { stateList, setStateList } = useContext(RollcallContext);


  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [callApi, savedData , savingState] = useApi({ url: "save-roll" });


  useEffect(() => {
     getStudents()
  }, [getStudents])


  useEffect(() => {
    console.log("Resetting.....");
    let temp_student = [];
    data?.students.forEach(student => {
      temp_student.push({ ...student, status: 'unmark'})
    })
    setStudents(temp_student);
  }, [data])


  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "sortName") {
      sortField == 'first_name' ? setSortField('last_name') : setSortField('first_name')
    }
    if (action === "sortOrder") {
      sortOrder == 'asc' ?  setSortOrder('desc'): setSortOrder('asc');
    }
  }

  const debouce = (fn: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: React.ChangeEvent<HTMLInputElement>[]) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false);
    }else if (action === "complete"){
      setIsRollMode(false);
      let rollinput:RollInput = {
        student_roll_states: stateList
      }
      callApi(rollinput)
    }else{
      console.log(action);
      action === "all" ? setSearchStatus('') : setSearchStatus(action);
    }
  }


  return (
    <>
      <S.PageContainer>
        <Toolbar setSearch={setSearch} debouce={debouce} sortOrder={sortOrder} sortField={sortField} onItemClick={onToolbarAction} />
        {savingState === "error" && (
          <S.BottomContainer>
            {savingState}
          </S.BottomContainer>
        )}

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && students && (
          <>
            {
              students
                .filter(student => PersonHelper.getFullName(student).toLocaleLowerCase().includes(search) )
                .filter(student => student.status.includes(searchStatus) )
                .sort((a, b) => {
                        return(
                          a[sortField].toString().localeCompare(b[sortField].toString(), "en") * (sortOrder === "desc" ? 1 : -1)
                      )})
                .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
              ))
            }
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sortName" | "sortOrder"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction) => void,
  sortField: string,
  sortOrder: string,
  debouce: (e: React.ChangeEvent<HTMLInputElement>) => void
  setSearch: React.Dispatch<React.SetStateAction<string>>
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortField, sortOrder, debouce, setSearch } = props
  return (
    <S.ToolbarContainer>
      <div>
        <S.Button onClick={() => onItemClick("sortName")}>{sortField === 'first_name' ? 'First Name' : 'Last Name'}</S.Button>
        <S.Button onClick={() => onItemClick("sortOrder")}><p>{sortOrder === 'asc' ? < FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />}</p></S.Button>
      </div>
      
      <S.SearchInput type="text" onChange={debouce((e) => {
        console.log('done..');
        setSearch(e.target.value)
      }, 200)} placeholder="Search Student" />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  BottomContainer: styled.div`
    background-color: white;
    opacity: 0.5;
    display: flex;
    position: absolute;
    justify-content: center;
    width: 100%;
    height: 100vh;
    align-items: center;
    
  `,
  SearchInput: styled.input`
    width: 50%;
    padding: 10px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 10px
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
