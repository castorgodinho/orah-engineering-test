import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { Activity } from "shared/models/activity"
import { useApi } from "shared/hooks/use-api"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { StudentContext } from "shared/helpers/student-context"
import { RolllStateType } from "shared/models/roll"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BorderRadius } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activities: Activity[] }>({ url: "get-activities" })


  useEffect(() => {
    getActivities();
  }, [getActivities]);
  useEffect(() => {
    console.log(data);
  }, [data]);

  const rollstate =   [
        { type: "present", count: 0 },
        { type: "late", count: 0 },
        { type: "absent", count: 0 },
    ]

  return <S.Container>
    
    <S.Heading>Activites</S.Heading>

    {loadState === "loading" && (
      <CenteredContainer>
        <FontAwesomeIcon icon="spinner" size="2x" spin />
      </CenteredContainer>
    )}

     {loadState === "loaded" && data && (
      <p style={{ textAlign: 'right', fontWeight: '700' }}>Total Records:  { data?.activity.length}</p>
    )}

    {loadState === "loaded" && data && (
      data?.activity.map((ele) => (
        <div key={ele.entity.id} style={{ margin: '10px 0px', boxShadow: '0px 0px 4px -2px black'}}>
          <div style={{ display: 'flex', backgroundColor: '#e4e4e4', padding: 15 }}>
            <p style={{ flex: 1 }}><span style={{ fontWeight: '700' }}>Date:</span> {(new Date(ele.date).toLocaleString('en-GB', { timeZone: 'UTC' }))} </p>
            <p style={{ flex: 1, textAlign: 'right' }}><span style={{ fontWeight: '700' }}>Roll Name:</span> {ele.entity.name} </p>
          </div>
          <div style={{ display: 'flex', backgroundColor: '#f9f9f9', flexWrap: 'wrap' }}>
            {
              ele.entity.student_roll_states.map((student, key) => (
                <S.Pill key={student.student_id}>
                  <span style={{ flex: 1, textAlign: 'center' }}>Student {student.student_id}</span>
                  <S.Badge bgColor={getBgColor(student.roll_state)}>{student.roll_state.toUpperCase() }</S.Badge>
                </S.Pill>
              ))
            }
          </div>
          <S.Content>
            <S.Summary>
              <FontAwesomeIcon icon="users" size="sm" />
              <S.IconText>
                {ele.entity.student_roll_states.length}
              </S.IconText>
            </S.Summary>
            {
              rollstate.map(roll => (
                <S.Summary>
                  <S.Icon border={roll.type} bgColor={getBgColor(roll.type)} >
                    <FontAwesomeIcon icon="check" size="sm" />
                  </S.Icon>
                  <S.IconText>
                    {ele.entity.student_roll_states.filter(val => val.roll_state === roll.type).length}
                  </S.IconText>
                </S.Summary>
              ))
            }
          </S.Content>
        </div>
      ))
    )}

    {loadState === "error" && (
      <CenteredContainer>
        <div>Failed to load</div>
      </CenteredContainer>
    )}

  </S.Container>
}

function getBgColor(type: RolllStateType) {
  switch (type) {
    case "unmark":
      return "#fff"
    case "present":
      return "#13943b"
    case "absent":
      return "#9b9b9b"
    case "late":
      return "#f5a623"
    default:
      return "#13943b"
  }
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  Pill: styled.div`
    padding: 10px;
    border: 1px solid #e4e4e4;
    display: flex;
    margin: 5px 5px;
    justify-content: center;
    align-items: center;
    width: 25%
  `,
  Badge: styled.span`
    background-color: ${({ bgColor }) => bgColor};;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
    color: white;
    flex: 1;
    text-align: center
  `,
  Heading: styled.p`
    font-size: 20px;
    font-weight: 700;
    text-align: center;
  `,
  
  Icon: styled.div<{ size: number; border: boolean; bgColor: string; }>`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    padding: 3px;
    margin: 2px;
    background-color: ${({ bgColor }) => bgColor};
    border-radius: ${BorderRadius.rounded};
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
  `,
  Content: styled.div`
    display: flex;
    border: 1px solid #f5f5f536;
    border-radius: ${BorderRadius.default};
    margin: 5px;
    background-color: #e4e4e4;
    justify-content: end
  `,
  Summary: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;
  `,
  IconText: styled.p`
    font-size: 12px;
    padding: 0px 4px
  `,
}

