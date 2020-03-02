const _state = {
  pending: false
}

const startPending = () => {
  _state.pending = true
}
const endPending = () => {
  _state.pending = false
}
const isPending = () => _state.pending

module.exports = {
  startPending,
  endPending,
  isPending,
}