import * as React from 'react'
import { connect } from 'react-redux'

import { selectProfile, updateUserName } from '../store/user'

function InfoItem({ title, content }) {
  return (
    <div className="info-container">
      <h1>{title}</h1>
      <p>{content}</p>
    </div>
  )
}

// const Program = () => {
//   if (!program.currentProgram) return null
//   return <InfoItem title="Program Name" content={program.currentProgram.name} />
// }

const Email = connect((state) => {
  const profile = selectProfile(state)

  return { email: profile ? profile.email : null }
})(({ email }) => {
  if (!email) return null
  return <InfoItem title="Email" content={email} />
})

const UserName = connect(
  (state) => {
    const profile = selectProfile(state)
    return {
      displayName: profile ? profile.displayName : null,
    }
  },
  { updateUserName }
)(({ displayName, updateUserName }) => {
  if (!displayName) return null

  return (
    <div className="info-container">
      <h1>User Name</h1>
      <p>{displayName}</p>
      <input
        type="text"
        value={displayName}
        onChange={(e) => updateUserName(e.target.value)}
      />
    </div>
  )
})

// const CurrentWeekBlockType = () => {
//   if (!workout.currentWeek) return null
//   return (
//     <InfoItem
//       title="Current Week Block Type"
//       content={workout.currentWeek.blockType}
//     />
//   )
// }

const UserInfo = () => {
  return (
    <div className="all-info-container">
      {/* <Program /> */}
      <UserName />
      <Email />
      {/* <CurrentWeekBlockType /> */}
    </div>
  )
}

export default UserInfo
