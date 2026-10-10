export function notFound(req, res) {
  res.status(404).json({ message: `No API route found for ${req.method} ${req.originalUrl}.` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Please check the submitted information." });
  }

  if (error.status === 403) {
    return res.status(403).json({ message: error.message });
  }

  if (error.status === 400) {
    return res.status(400).json({ message: "The request body could not be read." });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "This record already exists." });
  }

  console.error("API error:", error);
  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Something went wrong. Please try again.",
  });
}
