import {
	getDataByUsername,
	postData as postUser
} from '../models/UserModel.js'
import {
	insertInvalidAccessToken
} from '../models/AuthModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import response from '../utils/response.js'
import {
	validationResult
} from 'express-validator'

const generateAccessToken = (payload) => {
	return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '1h'
	})
}

export const validateLoginAndCreateToken = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = errors.array()

			return response.resFailed(400, {
				message: 'Invalid input value',
				input: error
			}, 'Login failed', res)
		}

		// CHECK USERNAME
		const [data] = await getDataByUsername(req.body.username)
		if (data.length === 0) return response.resFailed(400, {
			input: [{
				msg: 'Username tidak ditemukkan',
				path: 'username'
			}]
		}, 'Login failed', res)

		// CHECK PASSWORD
		const isPasswordMatch = await bcrypt.compare(req.body.password, data[0].password)
		if (!isPasswordMatch) return response.resFailed(400, {
			input: [{
				msg: 'Password salah',
				path: 'password'
			}]
		}, 'Login failed', res)

		const accessToken = generateAccessToken({
			id: data[0].id,
			username: data[0].username,
			role: data[0].role
		})

		response.resSuccess(200, {
			accessToken
		}, 'Login success', res)

	} catch (err) {
		response.resFailed(500, err.stack, 'Login failed', res)
	}
}

export const handleLogout = (req, res) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) return response.resFailed(403, {
		message: 'Sedang tidak login'
	}, 'Logout failed', res)

	try {
		insertInvalidAccessToken(token)

		res.sendStatus(200)
	} catch (err) {
		response.resFailed(500, err.message, 'Logout failed', res)
	}
}

export const handleRegister = async (req, res) => {
	try {
		const invalidInputMsg = 'Invalid input value'

		// VALIDASI INPUT
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = errors.array()

			return response.resFailed(400, {
				message: invalidInputMsg,
				input: error
			}, 'Register failed', res)
		}

		// CHECK JIKA USERNAME SUDAH ADA
		const [dataUser] = await getDataByUsername(req.body.username)
		if (dataUser.length !== 0) return response.resFailed(400, {
			message: invalidInputMsg,
			input: [{
				msg: 'Username sudah digunakkan',
				path: 'username'
			}]
		}, 'Register failed', res)

		// HASH PASSWORD
		req.body.password = await bcrypt.hash(req.body.password, 12)
		req.body.role = 'user'

		// POST DATA KE DATABASE
		const [data] = await postUser(req.body)

		response.resSuccess(201, data, 'Register success', res)

	} catch (err) {
		response.resFailed(500, err.message, 'Register failed', res)
	}
}