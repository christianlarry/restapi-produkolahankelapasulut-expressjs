import express from 'express'
import {body} from 'express-validator'
import {getAllData,getDataById,postData,updateData,updatePassword,updateUsername,deleteData} from '../controllers/UserController.js'
import valMsg from '../utils/validationMessage.js'
import checkRole from '../middlewares/checkRole.js'

const router = express.Router()

router.get('/user',checkRole('admin'),getAllData)
router.get('/user/:id',checkRole('admin'),getDataById)

router.post('/user',checkRole('admin'),[
    body('username')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .isLength({min: 4,max: 32}).withMessage('Minimal 4 sampai 32 karakter')
        .isAlpha().withMessage(valMsg.AlphaMsg)
        .toLowerCase().customSanitizer(value=>{
            if(value){
                return value.replace(' ','')
            }
        })
        .escape(),
    body('password')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .isStrongPassword({minSymbols: 0}).withMessage(valMsg.strongPassMsg),
    body('role')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .custom(value=>{
            if(['admin','user'].includes(value)) return true
            return false
        }).withMessage(valMsg.invalidOptionMsg)
        .escape()
],postData)

router.put('/user/:id',checkRole('admin'),[
    body('username')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .isLength({min: 4,max: 32}).withMessage('Minimal 4 sampai 32 karakter')
        .isAlpha().withMessage(valMsg.AlphaMsg)
        .toLowerCase().customSanitizer(value=>{
            if(value){
                return value.replace(' ','')
            }
        })
        .escape(),
    body('role')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .custom(value=>{
            if(['admin','user'].includes(value)) return true
            return false
        }).withMessage(valMsg.invalidOptionMsg)
        .escape()
],updateData)

router.patch('/user/username/:id',[
    body('username')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .isLength({min: 4,max: 32}).withMessage('Minimal 4 sampai 32 karakter')
        .toLowerCase().customSanitizer(value=>{
            if(value){
                return value.replace(' ','')
            }
        })
],updateUsername)

router.patch('/user/password/:id',[
    body('newPassword')
        .exists().withMessage(valMsg.existsMsg)
        .notEmpty().withMessage(valMsg.emptyMsg)
        .isStrongPassword({minSymbols: 0}).withMessage(valMsg.strongPassMsg)
        .optional({checkFalsy: true})
],updatePassword)

router.delete('/user/:id',checkRole('admin'),deleteData)

export default router;