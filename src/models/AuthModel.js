import db from '../config/Database.js'

export const getInvalidAccessTokenByToken = (token)=>{
    const sql = `SELECT * FROM invalid_access_tokens WHERE token = '${token}'`
            
    return db.query(sql)
}

export const insertInvalidAccessToken = (token)=>{
    const sql = `INSERT INTO invalid_access_tokens(token,expired_at) VALUES
                ('${token}',DATE_ADD(NOW(), INTERVAL 1 HOUR))`
            
    return db.query(sql)
}