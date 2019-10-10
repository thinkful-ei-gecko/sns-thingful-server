const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let basicToken;

    if(!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUN, tokenP] = AuthService.parseBasicToken(basicToken)

    if (!tokenUN || !tokenP) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    AuthService.getUserWithUserName(req.app.get('db'), tokenUN)
        .then(user => {
            if(!user || user.password !== tokenP) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            req.user = user
            next()
        })
        .catch(next)
}

module.exports = { requireAuth }