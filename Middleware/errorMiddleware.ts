
let errorHandler = ( err: { message: any; stack: any; }, _req: any, res: {
        statusCode: any; status: (arg0: any) => void; json: (arg0: {
            message: any;
            //additional info if in dev mode
            stack: any;
        }) => void;
    }, next: any ) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        //additional info if in dev mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};
module.exports = {
    errorHandler
};