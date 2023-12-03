export const resSuccess = (status,data,message,res,page)=>{
    if(!page){
        return res.status(status).json({
            code: status,
            message,
            data
        })
    }
    return res.status(status).json({
        code: status,
        message,
        data,
        page: {
            size: page.size,
            total: page.total,
            totalPages: page.totalPages,
            current: page.current
        }
    })
}

export const resFailed = (status,error,message,res)=>{
    return res.status(status).json({
        code: status,
        message,
        error,
    });
}

export default {resSuccess,resFailed}