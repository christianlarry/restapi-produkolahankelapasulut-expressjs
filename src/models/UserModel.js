import db from '../config/Database.js'

export const getAllData = ()=>{
    const sql = `SELECT id,username,password,role FROM users`

    return db.query(sql)
}

export const getDataById = (id)=>{
    const sql = `SELECT id,username,password,role FROM users
                WHERE users.id = ${id}`

    return db.query(sql)
}

export const getDataByUsername = (username)=>{
    const sql = `SELECT id,username,password,role
                FROM users
                WHERE username = '${username}'`

    return db.query(sql)
}

export const getDataByRole = (role)=>{
    const sql = `SELECT id,username,password,role
                FROM users
                WHERE role = '${role}'`

    return db.query(sql)
}

export const postData = (body)=>{
    const sql = `INSERT INTO users (username,password,role)
                VALUES ('${body.username}','${body.password}','${body.role}')`

    return db.query(sql)
}

export const updateData = (id,body)=>{
    const sql = `UPDATE users
                SET username = '${body.username}',role = '${body.role}' WHERE id = ${id}`

    return db.query(sql)
}

export const updateUsername = (id,username)=>{
    const sql = `UPDATE users 
                SET username = '${username}' WHERE id = ${id}`

    return db.query(sql)
}

export const updatePassword = (id,password)=>{
    const sql = `UPDATE users 
                SET password = '${password}' WHERE id = ${id}`

    return db.query(sql)
}

export const deleteData = (id)=>{
    const sql = `DELETE FROM users WHERE id = ${id}`

    return db.query(sql)
}