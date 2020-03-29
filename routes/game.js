var express = require('express')
var router = express.Router()

router.get('/:id', function(req, res) {
  if(req.originalUrl.includes('?fbclid=')) {
    const cleanUrl = decodeURI(req.originalUrl)
      .replace(/\?fbclid=.+/g, '')
      .replace(/ /g, '_')
    return res.redirect(cleanUrl)
  } else {
    res.render('game', {
      gameId: req.params.gameId,
      status: 'public'
    })
  }
})

router.post('/:id', function(req, res) {
  res.render('game', {
    gameId: req.body.gameId,
    status: req.body.status,
    password: req.body.password
  })
})

module.exports = router
