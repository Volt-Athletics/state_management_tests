const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

async function _parseBodyJSON(response) {
  let body
  try {
    body = await response.json()
  } catch (e) {
    body = null
  }

  return { ...response, body }
}

async function request({ url, body, method = 'GET' }) {
  url = `/api/${url}`
  if (body) body = JSON.stringify(body)
  const resp = await fetch(url, { headers, body, method })
  const parsed = await _parseBodyJSON(resp)
  return parsed.body
}

const service = {
  signIn(email, password) {
    return request({
      body: { email, password },
      method: 'POST',
      url: 'auth/sign_in',
    })
  },

  getPerson(personId) {
    return request({ url: `people/${personId}` })
  },

  getCustomProgramMembership(membershipId) {
    return request({
      url: `custom_program_memberships/${membershipId}`,
    })
  },

  getSmarSetsReferenceTables() {
    return request({
      url: 'smart_sets/reference_tables',
    })
  },

  getProgram(programId) {
    return request({ url: `custom_programs/${programId}` })
  },

  getBlockTypeDescriptions() {
    return request({ url: 'blocks' })
  },

  getWorkoutWeeks({ personId, programId }) {
    return request({
      url: `custom_programs/${programId}/workout_weeks?person_id=${personId}`,
    })
  },

  getWorkout({ weekId, dayNum, personId }) {
    return request({
      url: `workout_weeks/${weekId}/${dayNum}?person_id=${personId}`,
    })
  },
}

export default service
