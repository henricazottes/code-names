var express = require('express')
var router = express.Router()

router.get('/:id', function(req, res) {
  const cleanUrl = req.originalUrl.replace(/\?fbclid=.+/g, '')

  if (req.originalUrl !== cleanUrl) {
    return res.redirect(cleanUrl)
  } else {
    res.render('game', {
      gameId: req.params.gameId,
      status: 'public',
    })
  }
})

router.post('/:id', function(req, res) {
  res.render('game', {
    gameId: req.body.gameId,
    status: req.body.status,
    password: req.body.password,
  })
})

module.exports = router
