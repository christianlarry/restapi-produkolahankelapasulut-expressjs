import express from 'express'
import { body } from 'express-validator'
import valMsg from '../utils/validationMessage.js'
import checkRole from '../middlewares/checkRole.js'

import * as TokoController from '../controllers/TokoController.js'

const router = express.Router()

// POST VALIDATION RULES
const validation = [
  body('namaToko')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg)
    .isLength({max: 200}).withMessage('Maximal 200 karakter'),
  body('daerah')
    .exists().withMessage(valMsg.existsMsg)
    .notEmpty().withMessage(valMsg.emptyMsg)
    .isLength({max: 200}).withMessage('Maximal 200 karakter')
]

router.get('/toko',TokoController.getAllData)

// GET PENDING TOKO
router.get('/toko/pending',checkRole('admin'),TokoController.getAllPendingToko)
router.get('/toko/pending/post-by/:id',TokoController.getPendingTokoByPostById)
// router.get('/toko/pending/:id',TokoController.getPendingTokoById)

router.get('/toko/:id',TokoController.getDataById)
router.get('/toko/:id/produk',TokoController.getProdukByTokoId)

router.post('/toko',validation,TokoController.postData)
router.put('/toko/:id',checkRole('admin'),validation,TokoController.putData)
router.delete('/toko/:id',checkRole('admin'),TokoController.deleteData)

// POST/DELETE PENDING TOKO
router.post('/toko/pending',validation,TokoController.postPendingToko)
router.post('/toko/pending/:id/approve',checkRole('admin'),TokoController.approvePendingToko)
router.post('/toko/pending/:id/reject',checkRole('admin'),TokoController.rejectPendingToko)

router.delete('/toko/pending/:id',TokoController.deletePendingToko)

export default router