var router = require('express').Router();

var {isloggedin} = require('./../middleware/isloggedin');

router.use('/api/todos', require('./todoController'));
router.use('/api/users', require('./userController'));

router.get('/', function(req, res) {
    res.status(200).render('index');
});

router.get('/signup', isloggedin, (req, res) => {
    if(req.isloggedin) {
        res.redirect('/users/me');
    } else {
        res.status(200).render('signup');
    }
});

router.get('/about', (req, res) => {
    res.send({
        status: "ok"
    });
});

module.exports = router;