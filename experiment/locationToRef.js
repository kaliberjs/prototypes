module.exports = locationToRef

function locationToRef(data, prop) {
  return data.ref.root.child(data.child(prop).val())
}
