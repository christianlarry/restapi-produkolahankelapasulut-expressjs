import express from 'express'
const router = express.Router()

router.get('/',(req,res)=>{
  res.redirect('/api')
})

router.get('/api',(req,res)=>{
  res.status(200).json({
      message: 'Rest API oleh kelompok 1'
  })
})

export default router