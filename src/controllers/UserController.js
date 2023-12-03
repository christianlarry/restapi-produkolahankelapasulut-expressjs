import * as User from '../models/UserModel.js'
import response from '../utils/response.js'
import {validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import fs from 'fs'
import { insertInvalidAccessToken } from '../models/AuthModel.js'

export const getAllData = async (req,res)=>{
    try {
        if(req.query.role){
            const [data] = await User.getDataByRole(req.query.role)

            return response.resSuccess(200,data,'GET user success',res)
        }
        const [data] = await User.getAllData()

        response.resSuccess(200,data,'GET user success',res)
    } catch (err) {
        response.resFailed(500,err,'GET user failed',res)
    }
}

export const getDataById = async (req,res)=>{
    
    if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad Request, ID is Not a Number'},'GET user failed',res)
    
    try {
        const [data] = await User.getDataById(req.params.id)
        if(data.length <= 0) return response.resFailed(404,{message: 'Data not found'},'GET user failed',res)

        response.resSuccess(200,data,'GET user success',res)
    } catch (err) {
        response.resFailed(500,err,'GET user failed',res)
    }
}

export const postData = async (req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = errors.array()

            return response.resFailed(400,{message: 'Invalid input value',input: error},'POST user failed',res)
        }

		// CHECK JIKA USERNAME SUDAH ADA
		const [dataUser] = await User.getDataByUsername(req.body.username)
		if (dataUser.length !== 0) return response.resFailed(400, {
			message: 'Invalid input value',
			input: [{
				msg: 'Username sudah digunakkan',
				path: 'username'
			}]
		}, 'POST user failed', res)

        req.body.password = await bcrypt.hash(req.body.password,12)

        const [data] = await User.postData(req.body)

        response.resSuccess(201,data,'POST user success',res)
    } catch (err) {
        if(err.code === 'ER_DUP_ENTRY') return response.resFailed(
            400,
            {
                message: 'Duplicate entry',
                input: [{msg: 'Mohon maaf, username ini telah digunakan. Silahkan gunakan username lain.',param: 'username'}]
            },
            'POST user failed',
            res)

        response.resFailed(500,err,'POST user failed',res)
    }
}

export const updateData = async (req,res)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = errors.array()

            return response.resFailed(400,{message: 'Invalid input value',input: error},'PUT user failed',res)
        }

        const [data] = await User.updateData(req.params.id,req.body)
        if(data.affectedRows == 0) return response.resFailed(404,{message: 'Data not found'},'PUT user failed',res)

        response.resSuccess(200,data,'PUT user success',res)
    } catch (err) {
        response.resFailed(500,err,'PUT user failed',res)
    }
}

export const updateUsername = async (req,res)=>{
    try {
        if(req.user.role != 'admin' && req.user.id != req.params.id) return response.resFailed(401,{message: 'Tidak memiliki izin untuk mengubah data user lain'},'PATCH user failed',res)

        const [user] = await User.getDataById(req.params.id)

        const isPasswordMatch = await bcrypt.compare(req.body.password,user[0].password)
        if(!isPasswordMatch) return response.resFailed(403,{message: 'Password salah'},'PATCH user failed',res)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = errors.array()

            return response.resFailed(400,{message: 'Invalid input value',input: error},'PATCH user failed',res)
        }

        const [data] = await User.updateUsername(req.params.id,req.body.username)
        if(data.affectedRows == 0) return response.resFailed(404,{message: 'User not found'},'PATCH user failed',res)

        response.resSuccess(200,data,'PATCH user success',res)
    } catch (err) {
        response.resFailed(500,err,'PATCH user failed',res)
    }
}

export const updatePassword = async (req,res)=>{
    try {
        if(req.user.role != 'admin' && req.user.id != req.params.id) return response.resFailed(401,{message: 'Tidak memiliki izin untuk mengubah data user lain'},'PATCH user failed',res)

        if(req.user.role !== 'admin'){
            const [user] = await User.getDataById(req.params.id)
            const isPasswordMatch = await bcrypt.compare(req.body.password,user[0].password)
            if(!isPasswordMatch) return response.resFailed(403,{message: 'Password salah'},'PATCH user failed',res)
        }

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = errors.array()

            return response.resFailed(400,{message: 'Invalid input value',input: error},'PATCH user failed',res)
        }
        
        req.body.newPassword = await bcrypt.hash(req.body.newPassword,12)

        const [data] = await User.updatePassword(req.params.id,req.body.newPassword)
        if(data.affectedRows == 0) return response.resFailed(404,{message: 'User not found'},'PATCH user failed',res)

        if(req.user.id == req.params.id){
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]
            insertInvalidAccessToken(token)
        }

        response.resSuccess(200,data,'PATCH user success',res)
    } catch (err) {
        response.resFailed(500,err,'PATCH user failed',res)
    }
}

export const deleteData = async (req,res)=>{
    try {
        // DELETE PROFILE PICTURE
        const [data] = await User.getDataById(req.params.id)
        if(data.length == 0) return response.resFailed(404,{message: 'Data not found'},'DELETE data failed',res)

        if(data[0].picture_url){   
            const picturePath = 'public/'+data[0].picture_url.replace(process.env.API_BASE_URL,'')
            fs.unlink(picturePath,(err)=>{
                if(err) console.log(err)
            })
        }

        // DELETE DATA USER IN DATABASE
        const [result] = await User.deleteData(req.params.id)

        response.resSuccess(200,result,'DELETE data success',res)
    } catch (err) {
        console.log(err)
        response.resFailed(500,err,'DELETE data failed',res)
    }
}
