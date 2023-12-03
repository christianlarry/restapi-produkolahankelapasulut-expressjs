import * as Toko from '../models/TokoModel.js'
import {
	getProdukByTokoId as getProdukByToko
} from '../models/ProdukModel.js'
import {getDataById as getUserById} from '../models/UserModel.js'
import response from '../utils/response.js'

import {
	validationResult
} from 'express-validator'

export const getAllData = async (req, res) => {
	try {
		const query = req.query

		query.limit = (
			query.limit &&
			!isNaN(query.limit) &&
			query.limit > 0) ? query.limit : 25

		query.page = (
			query.page &&
			!isNaN(query.page) &&
			query.page > 0) ? query.page : 1

		// CEK JIKA ADA REQUEST QUERY PADA URL
		if (query.search) return (async () => {
			const [data] = await Toko.searchData(query.search)

			response.resSuccess(200, data, "GET searched toko success", res)
		})()

		const [data] = await Toko.getAllData((query.page - 1) * query.limit + 1, query.limit)
		const [
			[{
				total: totalData
			}]
		] = await Toko.totalData()

		const page = {
			size: data.length,
			total: totalData,
			totalPages: Math.ceil(totalData / data.length),
			current: query.page ? query.page : 1
		}

		response.resSuccess(200, data, "GET toko success", res, page)
	} catch (err) {
		console.log(err.stack)
		response.resFailed(500, err, 'GET toko failed', res)
	}
}

export const getDataById = async (req, res) => {
	try {
		const [data] = await Toko.getDataById(req.params.id)
		if(data.length <= 0) return response.resFailed(404,{message: 'Data not found'},'GET toko failed',res)

		response.resSuccess(200, data, "GET toko by id success", res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, error, 'GET toko failed', res)
	}
}

export const getProdukByTokoId = async (req, res) => {
	try {
		const [data] = await getProdukByToko(req.params.id)

		response.resSuccess(200, data, "GET produk by toko id success", res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'GET produk by toko id failed', res)
	}
}

export const postData = async (req, res) => {
	try {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			const error = result.array();

			return response.resFailed(400, {
				message: 'Invalid input value',
				input: error
			}, 'POST toko failed', res)
		}

		const [data] = await Toko.postData(req.body)
		response.resSuccess(201,data,'POST toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'POST toko failed', res)
	}
}

export const putData = async (req, res) => {
	try {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			const error = result.array();

			return response.resFailed(400, {
				message: 'Invalid input value',
				input: error
			}, 'PUT toko failed', res)
		}

		const [data] = await Toko.putData(req.params.id,req.body)
		if(data.affectedRows == 0) return response.resFailed(404,{message: 'Data not found'},'PUT toko failed',res)

		response.resSuccess(200,data,'PUT toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'PUT toko failed', res)
	}
}

export const deleteData = async (req, res) => {
	try {
		const [data] = await Toko.getDataById(req.params.id)
		if(data.length <= 0) return response.resFailed(404,{message: 'Data not found'},'DELETE toko failed',res)
		
		const [result] = await Toko.deleteData(req.params.id)

		response.resSuccess(200,result,'DELETE toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'DELETE toko failed', res)
	}
}

// PENDING TOKO CONTROLLER/LOGIC
export const getAllPendingToko = async (req,res)=>{
	try {
		const [pendingToko] = await Toko.getAllPendingToko()

		response.resSuccess(200,pendingToko,'GET pending toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'GET pending toko failed',res)
	}
}

// export const getPendingTokoById = async (req,res)=>{
// 	try {
// 		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'GET pending toko failed',res)

// 		const [pendingToko] = await Toko.getPendingTokoById(req.params.id)
// 		if(pendingToko.length <= 0) return response.resFailed(404,{message: 'Data not found'},'GET pending toko failed',res)

// 		response.resSuccess(200,pendingToko,'GET pending toko success',res)
// 	} catch (err) {
// 		console.log(err)
// 		response.resFailed(500,err,'GET pending toko failed',res)
// 	}
// }

export const getPendingTokoByPostById = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'GET pending toko failed',res)

		if(req.params.id != req.user.id && req.user.role != 'admin') return response.resFailed(403,{message: 'Tidak memiliki izin untuk melihat pending toko dari user lain!'},'GET pending toko failed',res)

		const [user] = await getUserById(req.params.id)
		if(user.length === 0) return response.resFailed(404,{message: `User with id ${req.params.id} not found`},'GET pending toko failed',res)

		const [pendingToko] = await Toko.getPendingTokoByPostById(req.params.id)
		response.resSuccess(200,pendingToko,'GET pending toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'GET pending toko failed',res)
	}
}

export const postPendingToko = async (req,res)=>{
	try {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			const error = result.array();

			return response.resFailed(400, {
				message: 'Invalid input value',
				input: error
			}, 'POST pending toko failed', res)
		}

		const [pendingDataByUser] = await Toko.getPendingTokoByPostById(req.user.id)
		if(pendingDataByUser.length >= 3 && req.user.role != 'admin') return response.resFailed(403,{message: 'Telah mencapai batas maksimum pending post data toko sebanyak 3 kali'},'POST pending toko failed',res)

		req.body.postBy = req.user.id

		const [postPendingToko] = await Toko.postPendingToko(req.body)
		response.resSuccess(201,postPendingToko,'POST pending toko success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST pending toko failed',res)
	}
}

export const deletePendingToko = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'DELETE pending toko failed',res)

		const [pendingToko] = await Toko.getPendingTokoById(req.params.id)
		if(pendingToko.length === 0) return response.resFailed(404,{message: `Pending toko with id ${req.params.id} not found`},'DELETE pending toko failed',res)

		if(req.user.id != pendingToko[0].post_by && req.user.role != 'admin') return response.resFailed(403,{message: `Tidak memiliki izin untuk menghapus data user lain`},'DELETE pending toko failed',res)

		const [result] = await Toko.deletePendingToko(req.params.id)
		response.resSuccess(200,result,'DELETE pending toko success',res)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'DELETE pending toko failed',res)
	}
}

export const approvePendingToko = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'POST approve pending toko failed',res)

		const [pendingToko] = await Toko.getPendingTokoById(req.params.id)
		if(pendingToko.length <= 0) return response.resFailed(404,{message: 'Data not found'},'POST approve pending toko failed',res)

		await Toko.postData({namaToko:pendingToko[0].nama_toko,daerah:pendingToko[0].daerah})
		await Toko.patchPendingTokoStatus(req.params.id,'approved')

		res.sendStatus(200)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST approve pending toko failed',res)
	}
}

export const rejectPendingToko = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'POST reject pending toko failed',res)

		const [pendingToko] = await Toko.getPendingTokoById(req.params.id)
		if(pendingToko.length <= 0) return response.resFailed(404,{message: 'Data not found'},'POST reject pending toko failed',res)

		await Toko.patchPendingTokoStatus(req.params.id,'rejected')

		res.sendStatus(200)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST reject pending toko failed',res)
	}
}