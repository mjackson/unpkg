/**
 * Useful for wrapping `async` request handlers so they
 * automatically propagate errors.
 */
export default function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(error => {
      console.error(`Unexpected error in ${handler.name}!`);
      console.error(error);

      next(error);
    });
  };
}
