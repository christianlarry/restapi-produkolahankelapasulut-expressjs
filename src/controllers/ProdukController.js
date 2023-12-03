import * as Produk from '../models/ProdukModel.js'
import response from '../utils/response.js'
import {
	validationResult
} from 'express-validator'
import {getDataById as getUserById} from '../models/UserModel.js'
import {getDataById as getTokoById} from '../models/TokoModel.js'

export const getAllData = async (req, res) => {
	try {
		const query = req.query

		query.limit = (
			query.limit&&
			!isNaN(query.limit)&&
			query.limit>0) ? query.limit : 25
			
		query.page = (
			query.page&&
			!isNaN(query.page)&&
			query.page>0) ? query.page : 1

		if (query.search) return (async ()=>{
			const [data] = await Produk.searchData(query.search)

			response.resSuccess(200, data, "GET searched produk success", res)
		})()

		const [data] = await Produk.getAllData((query.page-1)*query.limit+1,query.limit)
		const [[{total:totalData}]] = await Produk.totalData()

		const page = {
			size: data.length,
			total: totalData,
			totalPages: Math.ceil(totalData/data.length),
			current: query.page ? query.page : 1
		}

		response.resSuccess(200, data, 'GET produk success', res,page)
	} catch (err) {
		response.resFailed(500, err, "GET produk failed", res)
	}
}

export const getDataById = async (req, res) => {
	try {
		const [data] = await Produk.getDataById(req.params.id)

		response.resSuccess(200, data, 'GET produk success', res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, "GET produk failed", res)
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
			}, 'POST produk failed', res)
		}

		const [toko] = await getTokoById(req.body.idToko)
		if(toko.length === 0) return response.resFailed(404,{message:`Toko with id ${req.body.idToko} not found!`},'POST produk failed',res)

		const [data] = await Produk.postData(req.body)
		response.resSuccess(201,data,'POST produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'POST produk failed', res)
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
			}, 'PUT produk failed', res)
		}

		const [data] = await Produk.putData(req.params.id,req.body)
		if(data.affectedRows == 0) return response.resFailed(404,{message: 'Data not found'},'PUT produk failed',res)

		response.resSuccess(200,data,'PUT produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'PUT produk failed', res)
	}
}

export const deleteData = async (req, res) => {
	try {
		const [data] = await Produk.getDataById(req.params.id)
		if(data.length <= 0) return response.resFailed(404,{message: 'Data not found'},'DELETE produk failed',res)
		
		const [result] = await Produk.deleteData(req.params.id)

		response.resSuccess(200,result,'DELETE produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500, err, 'DELETE produk failed', res)
	}
}

// PENDING PRODUK CONTROLLER/LOGIC
export const getAllPendingProduk = async (req,res)=>{
	try {
		const [pendingProduk] = await Produk.getAllPendingProduk()

		response.resSuccess(200,pendingProduk,'GET pending produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'GET pending produk failed',res)
	}
}

export const getPendingProdukByPostById = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'GET pending produk failed',res)


		if(req.params.id != req.user.id && req.user.role != 'admin') return response.resFailed(403,{message: 'Tidak memiliki izin untuk melihat pending produk dari user lain!'},'GET pending produk failed',res)

		const [user] = await getUserById(req.params.id)
		if(user.length === 0) return response.resFailed(404,{message: `User with id ${req.params.id} not found`},'GET pending produk failed',res)

		const [pendingProduk] = await Produk.getPendingProdukByPostById(req.params.id)
		response.resSuccess(200,pendingProduk,'GET pending produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'GET pending produk failed',res)
	}
}

export const postPendingProduk = async (req,res)=>{
	try {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			const error = result.array();

			return response.resFailed(400, {
				message: 'Invalid input value',
				input: error
			}, 'POST pending produk failed', res)
		}

		const [pendingDataByUser] = await Produk.getPendingProdukByPostById(req.user.id)
		if(pendingDataByUser.length >= 5 && req.user.role != 'admin') return response.resFailed(403,{message: 'Telah mencapai batas maksimum pending post data produk sebanyak 3 kali'},'POST pending produk failed',res)

		const [toko] = await getTokoById(req.body.idToko)
		if(toko.length === 0) return response.resFailed(404,{message:`Toko with id ${req.body.idToko} not found!`},'POST produk failed',res)

		req.body.postBy = req.user.id

		const [postPendingProduk] = await Produk.postPendingProduk(req.body)
		response.resSuccess(201,postPendingProduk,'POST pending produk success',res)
	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST pending produk failed',res)
	}
}

export const deletePendingProduk = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'DELETE pending produk failed',res)

		const [pendingProduk] = await Produk.getPendingProdukById(req.params.id)
		if(pendingProduk.length === 0) return response.resFailed(404,{message: `Pending produk with id ${req.params.id} not found`},'DELETE pending produk failed',res)

		if(req.user.id != pendingProduk[0].post_by && req.user.role != 'admin') return response.resFailed(403,{message: `Tidak memiliki izin untuk menghapus data user lain`},'DELETE pending produk failed',res)

		const [result] = await Produk.deletePendingProduk(req.params.id)
		response.resSuccess(200,result,'DELETE pending produk success',res)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'DELETE pending produk failed',res)
	}
}

export const approvePendingProduk = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'POST approve pending produk failed',res)

		const [pendingProduk] = await Produk.getPendingProdukById(req.params.id)
		if(pendingProduk.length === 0) return response.resFailed(404,{message: 'Data not found'},'POST approve pending produk failed',res)

		await Produk.postData({
			idToko:pendingProduk[0].id_toko,
			namaProduk:pendingProduk[0].nama_produk,
			harga:pendingProduk[0].harga,
			description:pendingProduk[0].description,
			manfaat:pendingProduk[0].manfaat,
		})
		await Produk.patchPendingProdukStatus(req.params.id,'approved')

		res.sendStatus(200)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST approve pending produk failed',res)
	}
}

export const rejectPendingProduk = async (req,res)=>{
	try {
		if(isNaN(req.params.id)) return response.resFailed(400,{message: 'Bad request, ID must be a number'},'POST reject pending produk failed',res)

		const [pendingToko] = await Produk.getPendingProdukById(req.params.id)
		if(pendingToko.length <= 0) return response.resFailed(404,{message: 'Data not found'},'POST reject pending produk failed',res)

		await Produk.patchPendingProdukStatus(req.params.id,'rejected')

		res.sendStatus(200)

	} catch (err) {
		console.log(err)
		response.resFailed(500,err,'POST reject pending produk failed',res)
	}
}