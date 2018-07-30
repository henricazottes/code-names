var express = require('express')
var router = express.Router()

router.get('/:id', function(req, res) {
  res.render('game')
})

router.post('/:id', function(req, res) {
  res.render('game', { gameId: req.body.gameId, status: req.body.status })
})



module.exports = router
