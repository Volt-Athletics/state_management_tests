import * as React from 'react'
import { observer } from 'mobx-react'

import { useMst } from '../stores'

function InfoItem({ title, content }) {
  return (
    <div className="info-container">
      <h1>{title}</h1>
      <p>{content}</p>
    </div>
  )
}

const Program = observer(() => {
  const { program } = useMst()
  if (!program.currentProgram) return null
  return <InfoItem title="Program Name" content={program.currentProgram.name} />
})

const Email = observer(() => {
  const { user } = useMst()
  if (!user.profile) return null
  return <InfoItem title="Email" content={user.profile.email} />
})

const UserName = observer(() => {
  const { user } = useMst()
  if (!user.profile) return null

  return (
    <div className="info-container">
      <h1>User Name</h1>
      <p>{user.profile.displayName}</p>
      <input
        type="text"
        value={user.profile.displayName}
        onChange={(e) => user.setUserName(e.target.value)}
      />
    </div>
  )
})

const CurrentWeekBlockType = observer(() => {
  const { workout } = useMst()
  if (!workout.currentWeek) return null
  return (
    <InfoItem
      title="Current Week Block Type"
      content={workout.currentWeek.blockType}
    />
  )
})

const UserInfo = () => {
  return (
    <div className="all-info-container">
      <Program />
      <UserName />
      <Email />
      <CurrentWeekBlockType />
    </div>
  )
}

export default UserInfo
