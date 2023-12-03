const checkRole = (requiredRole)=>{
    return (req,res,next)=>{
        if(typeof requiredRole === 'string'){

            if(req.user.role != requiredRole) return res.sendStatus(403)

            next()

        }else if(Array.isArray(requiredRole)){

            if(!requiredRole.includes(req.user.role)) return res.sendStatus(403)

            next()
        }else{
            throw new Error('Invalid type of Required Role')
        }
    }
}

export default checkRole