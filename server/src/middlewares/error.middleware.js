export function errorMiddleware(err, req, res, next) {
  console.error("🔥 ERROR:", err);
  res.status(err.status || 500).json({
    error: err.publicMessage || "Internal Server Error",
    details: err.message,
  });
}
