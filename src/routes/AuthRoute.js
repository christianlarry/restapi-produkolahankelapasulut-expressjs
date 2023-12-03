import express from 'express'
import {
    validateLoginAndCreateToken,
    handleLogout,
    handleRegister
} from '../controllers/AuthController.js'
import authenticateToken from '../middlewares/authenticateToken.js'
import {
    body
} from 'express-validator'
import valMsg from '../utils/validationMessage.js'

const router = express.Router()

const dataValidation = [
    body('username')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg)
    .isLength({
        min: 4,
        max: 32
    }).withMessage('Minimal 4 sampai 32 karakter')
    .toLowerCase().customSanitizer(value => {
        if (value) {
            return value.replace(' ', '')
        }
    })
    .escape(),
    body('password')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg)
    .isStrongPassword({
        minSymbols: 0
    }).withMessage(valMsg.strongPassMsg)
]

// POST
router.post('/register', dataValidation, handleRegister)
router.post('/login',[
    body('username')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg),
    body('password')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg)
], validateLoginAndCreateToken)
router.post('/logout', authenticateToken, handleLogout)

router.get('/check-token',authenticateToken,(req,res)=>res.sendStatus(200))

export default router