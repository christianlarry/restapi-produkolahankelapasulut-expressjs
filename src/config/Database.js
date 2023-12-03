import mysql from 'mysql2'

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_DATABASE = process.env.DB_NAME || 'abs_olahankelapa'

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_DATABASE
})

db.getConnection(err =>{
    if(err) throw err
    console.log(`Successfuly connected to database ${DB_DATABASE}`)
})

export default db.promise()