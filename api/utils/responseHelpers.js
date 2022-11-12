const badRequest = (res, message) => {
  return res.status(400).json({ message });
};

const okWithContent = (res, content) => {
  return res.status(200).json(content);
};

const createdWithContent = (res, content) => {
  return res.status(201).json(content);
};

const conflict = (res, message) => {
  return res.status(409).json({ message });
};

const notFound = (res, message) => {
  return res.status(404).json({ message });
};

const noContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  badRequest,
  okWithContent,
  createdWithContent,
  conflict,
  notFound,
  noContent,
};
