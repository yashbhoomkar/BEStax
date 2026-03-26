function serializeDocument(document) {
  if (!document) {
    return null;
  }

  const object = typeof document.toObject === "function" ? document.toObject() : { ...document };
  object.id = String(object._id || object.id);
  delete object._id;
  delete object.__v;
  return object;
}

module.exports = {
  serializeDocument
};
