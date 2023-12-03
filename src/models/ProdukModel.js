import db from '../config/Database.js'

export const getAllData = (offset = 1, limit = 25) => {
    const sql = `SELECT produk.id,id_toko,nama_produk,description,manfaat,harga,nama_toko,daerah 
                FROM produk
                INNER JOIN toko ON toko.id = id_toko
                LIMIT ${offset-1},${limit}
                `

    return db.query(sql)
}

export const getDataById = (id) => {
    const sql = `SELECT produk.id,id_toko,nama_produk,description,manfaat,harga,nama_toko,daerah 
                FROM produk 
                INNER JOIN toko ON toko.id = id_toko
                WHERE produk.id=${id}`

    return db.query(sql)
}

export const searchData = (query) => {
    const sql = `SELECT 
    produk.id,
    id_toko,
    nama_produk,
    harga,
    description,
    manfaat,
    nama_toko,
    daerah 
    FROM produk
    INNER JOIN toko ON toko.id = id_toko
    WHERE
    nama_produk LIKE '%${query}%' OR 
    description LIKE '%${query}%'`

    return db.query(sql)
}

export const totalData = () => {
    const sql = `SELECT COUNT(*) as total FROM produk`

    return db.query(sql)
}

export const getProdukByTokoId = (id) => {
    const sql = `SELECT produk.id,id_toko,nama_produk,harga,description,manfaat 
                FROM produk
                WHERE id_toko = ${id}
                ORDER BY nama_produk ASC`

    return db.query(sql)
}

export const postData = (body) => {
    const sql = `INSERT INTO produk(id_toko,nama_produk,harga,description,manfaat) VALUES
                (${body.idToko},'${body.namaProduk}',${body.harga},'${body.description}','${body.manfaat}')`

    return db.query(sql)
}

export const putData = (id, body) => {
    const sql = `UPDATE produk 
                SET
                    id_toko=${body.idToko}, 
                    nama_produk='${body.namaProduk}', 
                    harga=${body.harga},
                    description='${body.description}',
                    manfaat='${body.manfaat}'
                WHERE id=${id}`

    return db.query(sql)
}

export const deleteData = (id) => {
    const sql = `DELETE FROM produk
                WHERE id=${id}`

    return db.query(sql)
}

// PENDING PRODUK MODEL
export const getAllPendingProduk = ()=>{
    const sql = `SELECT pending_produk.*,toko.nama_toko,toko.daerah,users.username AS post_by_username FROM pending_produk
                INNER JOIN toko ON id_toko=toko.id
                INNER JOIN users ON post_by=users.id`

    return db.query(sql)
}

export const getPendingProdukById = (id)=>{
    const sql = `SELECT pending_produk.*,toko.nama_toko,toko.daerah,users.username AS post_by_username FROM pending_produk 
                INNER JOIN toko ON id_toko=toko.id
                INNER JOIN users ON post_by=users.id
                WHERE pending_produk.id=${id}`

    return db.query(sql)
}

export const getPendingProdukByPostById = (postById)=>{
    const sql = `SELECT pending_produk.*,toko.nama_toko,toko.daerah,users.username AS post_by_username FROM pending_produk
                INNER JOIN toko ON id_toko=toko.id
                INNER JOIN users ON post_by=users.id 
                WHERE post_by=${postById}`

    return db.query(sql)
}

export const postPendingProduk = (body)=>{
    const sql = `INSERT INTO pending_produk(post_by,id_toko,nama_produk,harga,description,manfaat,status) VALUES
                (${body.postBy},${body.idToko},'${body.namaProduk}',${body.harga},'${body.description}','${body.manfaat}','pending')`

    return db.query(sql)
}

export const patchPendingProdukStatus = (id,status)=>{
    const sql = `UPDATE pending_produk SET status='${status}' WHERE id=${id}`

    return db.query(sql)
}

export const deletePendingProduk = (id)=>{
    const sql = `DELETE FROM pending_produk
                WHERE id=${id}`
    
    return db.query(sql)
}