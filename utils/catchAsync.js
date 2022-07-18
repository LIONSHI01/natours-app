/*
1) The module should return a function but not call a function, so use 'return' to return a function, otherwise the below example will call the function directly: 

module.exports = (fn) => {
    fn(req, res, next).catch((err) => next(err));
};

2) put (req,res,next) into the annoymous funciton, so the output function contain these variables

3) put err into next(), all content put into next() will be recognized as Error by Express

*/

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
